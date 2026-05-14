import { BadRequestException, ValidationError } from '@nestjs/common';
import { ErrorCode } from '../exceptions/error-code';

/**
 * Flattens a class-validator `ValidationError` tree (including nested
 * objects) into a flat list of human-readable constraint messages.
 */
function flattenMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      messages.push(...flattenMessages(error.children));
    }
  }

  return messages;
}

/**
 * Exception factory for the global `ValidationPipe`.
 *
 * Nest's default factory produces `{ statusCode, message: string[], error:
 * 'Bad Request' }` — no stable machine code. This factory instead throws a
 * `BadRequestException` whose payload carries `error: 'VALIDATION_ERROR'`,
 * with the per-field constraint messages preserved under `details.messages`
 * for developers/logs.
 *
 * The `GlobalExceptionFilter` reads `error` and `details` from this payload
 * and emits the standardized contract.
 */
export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const messages = flattenMessages(errors);

  return new BadRequestException({
    statusCode: 400,
    error: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    details: { messages },
  });
}
