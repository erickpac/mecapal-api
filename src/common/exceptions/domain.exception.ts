import { HttpStatus } from '@nestjs/common';

/**
 * Base class for all domain exceptions across the API.
 *
 * Every domain exception carries:
 *  - `code`: a stable, machine-readable identifier in SCREAMING_SNAKE_CASE
 *    (e.g. `ADDRESS_NOT_FOUND`). Clients map this code to a localized string;
 *    they never display `message`.
 *  - `httpStatus`: the HTTP status the global filter should respond with.
 *  - `message`: human/developer/log-facing only. Never shown to end users.
 *
 * The `GlobalExceptionFilter` reads these properties and emits the
 * standardized error contract:
 *   `{ statusCode, error: <code>, message, ...details }`
 *
 * Subclasses may expose extra contextual fields by overriding `details`.
 */
export abstract class DomainException extends Error {
  /** Stable machine-readable error code (SCREAMING_SNAKE_CASE). */
  public readonly code: string;

  /** HTTP status the response should use. */
  public readonly httpStatus: HttpStatus;

  constructor(message: string, code: string, httpStatus: HttpStatus) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
  }

  /**
   * Extra fields to merge into the error response body alongside
   * `statusCode`, `error` and `message`. Override in subclasses that
   * need to surface contextual data (e.g. `blockers`, `scheduledFor`).
   */
  get details(): Record<string, unknown> | undefined {
    return undefined;
  }
}
