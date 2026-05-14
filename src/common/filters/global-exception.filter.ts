import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { ErrorCode } from '../exceptions/error-code';
import { hasErrorCode } from '../exceptions/error-coded.exception';

/** Lowest HTTP status considered a server-side (5xx) error. */
const SERVER_ERROR_THRESHOLD = 500;

/**
 * Shape of every error response emitted by the API.
 *
 * `error` is the stable, machine-readable code clients map to localized
 * strings (`errors.server.*`). `message` is dev/log-facing only. Extra
 * contextual fields (e.g. `blockers`, `scheduledFor`, `details`) are merged
 * in at the top level.
 */
interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Catch-all exception filter that enforces the standardized error contract
 * for every error response in the API:
 *
 *   { statusCode, error: <ERROR_CODE>, message, ...details }
 *
 * Resolution order:
 *  1. `DomainException` — uses its `code`, `httpStatus` and `details`. Every
 *     domain exception across the API (auth, account, address, vehicle,
 *     delivery, order, payment, bank-account, settlement, review, incident,
 *     user) extends this base.
 *  2. `HttpException` carrying a `code` (e.g. the custom ValidationPipe, or
 *     any HttpException whose payload includes a SCREAMING_SNAKE_CASE
 *     `error`/`code`) — uses that code.
 *  3. Built-in `HttpException` (NotFoundException, BadRequestException, …) —
 *     mapped from HTTP status to a generic stable code; per-field
 *     validation messages are preserved under `details`.
 *  4. Anything else — `INTERNAL_ERROR` with a generic message; internals
 *     are logged but never leaked to the client.
 *
 * Registered as the single global `APP_FILTER` in `AppModule`, so it is the
 * one place the error contract is enforced — nothing falls through to a raw,
 * code-less 500.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    const body = this.buildBody(exception);

    if (body.statusCode >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        `${body.error}: ${this.describe(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${body.error}: ${body.message}`);
    }

    response.status(body.statusCode).json(body);
  }

  private buildBody(exception: unknown): ErrorResponseBody {
    if (exception instanceof DomainException) {
      return {
        statusCode: exception.httpStatus,
        error: exception.code,
        message: exception.message,
        ...exception.details,
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    // Unknown / unexpected error — never leak internals to the client.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    };
  }

  private fromHttpException(exception: HttpException): ErrorResponseBody {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    // Default human message and the per-field detail (for validation errors).
    let message = exception.message;
    let details: Record<string, unknown> | undefined;

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>;

      if (typeof record.message === 'string') {
        message = record.message;
      } else if (Array.isArray(record.message)) {
        // class-validator per-field messages.
        message = 'Validation failed';
        details = { messages: record.message };
      }

      if (typeof record.details === 'object' && record.details !== null) {
        details = record.details as Record<string, unknown>;
      }
    } else if (typeof payload === 'string') {
      message = payload;
    }

    // Prefer an explicit code carried by the exception or its payload;
    // otherwise fall back to a generic code derived from the HTTP status.
    const explicitCode = this.extractCode(exception, payload);
    const error = explicitCode ?? this.codeForStatus(status);

    return { statusCode: status, error, message, ...details };
  }

  /**
   * Extracts a stable code from the exception instance (`code` property) or
   * its response payload (`error` or `code` field), if present. Nest's
   * default `error` text ("Bad Request", "Not Found", …) is ignored — only
   * SCREAMING_SNAKE_CASE machine codes are accepted.
   */
  private extractCode(
    exception: HttpException,
    payload: string | object,
  ): string | undefined {
    if (hasErrorCode(exception)) {
      return exception.code;
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const candidate = record.error ?? record.code;
      if (
        typeof candidate === 'string' &&
        /^[A-Z][A-Z0-9_]*$/.test(candidate)
      ) {
        return candidate;
      }
    }

    return undefined;
  }

  /** Maps an HTTP status to a generic, stable fallback error code. */
  private codeForStatus(status: number): ErrorCode {
    // `HttpException.getStatus()` always returns a valid HTTP status code.
    switch (status as HttpStatus) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      default:
        return status >= SERVER_ERROR_THRESHOLD
          ? ErrorCode.INTERNAL_ERROR
          : ErrorCode.BAD_REQUEST;
    }
  }

  private describe(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    return typeof exception === 'string' ? exception : 'Unknown error';
  }
}
