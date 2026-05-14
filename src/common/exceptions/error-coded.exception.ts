import { ErrorCode } from './error-code';

/**
 * Marker interface for exceptions that carry a stable machine-readable error
 * code. Domain exceptions that must extend a NestJS `HttpException` (instead
 * of `DomainException`) implement this so the `GlobalExceptionFilter` can
 * still surface a stable `error` code.
 */
export interface ErrorCoded {
  /** Stable machine-readable error code (SCREAMING_SNAKE_CASE). */
  readonly code: ErrorCode;
}

/**
 * Type guard: true when the given value exposes a non-empty string `code`.
 */
export function hasErrorCode(value: unknown): value is ErrorCoded {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as { code: unknown }).code === 'string' &&
    (value as { code: string }).code.length > 0
  );
}
