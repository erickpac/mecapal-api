import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';
import { ErrorCode } from './error-code';
import { hasErrorCode } from './error-coded.exception';

class SampleException extends DomainException {
  constructor() {
    super('Sample failure', ErrorCode.ADDRESS_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

class SampleExceptionWithDetails extends DomainException {
  constructor(private readonly scheduledFor: Date) {
    super(
      'Already scheduled',
      ErrorCode.DELETION_ALREADY_SCHEDULED,
      HttpStatus.CONFLICT,
    );
  }

  get details(): Record<string, unknown> {
    return { scheduledFor: this.scheduledFor };
  }
}

describe('DomainException', () => {
  it('exposes code, httpStatus and message', () => {
    const exception = new SampleException();

    expect(exception).toBeInstanceOf(Error);
    expect(exception.code).toBe(ErrorCode.ADDRESS_NOT_FOUND);
    expect(exception.httpStatus).toBe(HttpStatus.NOT_FOUND);
    expect(exception.message).toBe('Sample failure');
  });

  it('sets the exception name to the concrete class name', () => {
    expect(new SampleException().name).toBe('SampleException');
  });

  it('returns undefined details by default', () => {
    expect(new SampleException().details).toBeUndefined();
  });

  it('allows subclasses to surface contextual details', () => {
    const date = new Date('2026-06-01T00:00:00.000Z');
    expect(new SampleExceptionWithDetails(date).details).toEqual({
      scheduledFor: date,
    });
  });

  it('is detected by the hasErrorCode type guard', () => {
    expect(hasErrorCode(new SampleException())).toBe(true);
  });
});

describe('hasErrorCode', () => {
  it('is true for objects with a non-empty string code', () => {
    expect(hasErrorCode({ code: 'SOME_CODE' })).toBe(true);
  });

  it('is false for objects without a usable code', () => {
    expect(hasErrorCode({ code: '' })).toBe(false);
    expect(hasErrorCode({ code: 123 })).toBe(false);
    expect(hasErrorCode({})).toBe(false);
    expect(hasErrorCode(null)).toBe(false);
    expect(hasErrorCode('not an object')).toBe(false);
  });
});
