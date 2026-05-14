import { BadRequestException, ValidationError } from '@nestjs/common';
import { validationExceptionFactory } from './validation-exception.factory';
import { ErrorCode } from '../exceptions/error-code';

function makeError(
  property: string,
  constraints: Record<string, string>,
  children: ValidationError[] = [],
): ValidationError {
  return { property, constraints, children } as ValidationError;
}

describe('validationExceptionFactory', () => {
  it('returns a BadRequestException carrying VALIDATION_ERROR', () => {
    const exception = validationExceptionFactory([
      makeError('email', { isEmail: 'email must be an email' }),
    ]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getStatus()).toBe(400);

    const payload = exception.getResponse() as Record<string, unknown>;
    expect(payload.error).toBe(ErrorCode.VALIDATION_ERROR);
    expect(payload.message).toBe('Validation failed');
    expect(payload.details).toEqual({
      messages: ['email must be an email'],
    });
  });

  it('flattens constraint messages from multiple fields', () => {
    const exception = validationExceptionFactory([
      makeError('email', { isEmail: 'email must be an email' }),
      makeError('name', {
        isNotEmpty: 'name should not be empty',
        isString: 'name must be a string',
      }),
    ]);

    const payload = exception.getResponse() as {
      details: { messages: string[] };
    };
    expect(payload.details.messages).toEqual([
      'email must be an email',
      'name should not be empty',
      'name must be a string',
    ]);
  });

  it('flattens constraint messages from nested children', () => {
    const exception = validationExceptionFactory([
      makeError('address', {}, [
        makeError('city', { isNotEmpty: 'city should not be empty' }),
      ]),
    ]);

    const payload = exception.getResponse() as {
      details: { messages: string[] };
    };
    expect(payload.details.messages).toEqual(['city should not be empty']);
  });

  it('produces an empty message list when there are no constraints', () => {
    const exception = validationExceptionFactory([]);

    const payload = exception.getResponse() as {
      details: { messages: string[] };
    };
    expect(payload.details.messages).toEqual([]);
  });
});
