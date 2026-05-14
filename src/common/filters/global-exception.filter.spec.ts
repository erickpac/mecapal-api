import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { DomainException } from '../exceptions/domain.exception';
import { ErrorCode } from '../exceptions/error-code';

class TestDomainException extends DomainException {
  constructor() {
    super('Something went wrong in the domain', ErrorCode.ORDER_NOT_FOUND, 404);
  }
}

class TestDomainExceptionWithDetails extends DomainException {
  constructor() {
    super('Blocked', ErrorCode.DELETION_BLOCKED, HttpStatus.CONFLICT);
  }

  get details(): Record<string, unknown> {
    return { blockers: ['ACTIVE_ORDERS'] };
  }
}

interface CapturedResponse {
  statusCode?: number;
  body?: Record<string, unknown>;
}

function makeHost(captured: CapturedResponse): ArgumentsHost {
  const response: {
    status: (code: number) => typeof response;
    json: (body: Record<string, unknown>) => typeof response;
  } = {
    status: (code: number) => {
      captured.statusCode = code;
      return response;
    },
    json: (body: Record<string, unknown>) => {
      captured.body = body;
      return response;
    },
  };

  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
    }),
  } as unknown as ArgumentsHost;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let captured: CapturedResponse;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    captured = {};
    // Silence the logger so failing-path logs don't clutter test output.
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    jest.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined);
  });

  it('maps a DomainException to { statusCode, error, message }', () => {
    filter.catch(new TestDomainException(), makeHost(captured));

    expect(captured.statusCode).toBe(404);
    expect(captured.body).toEqual({
      statusCode: 404,
      error: ErrorCode.ORDER_NOT_FOUND,
      message: 'Something went wrong in the domain',
    });
  });

  it('merges DomainException details into the response body', () => {
    filter.catch(new TestDomainExceptionWithDetails(), makeHost(captured));

    expect(captured.statusCode).toBe(HttpStatus.CONFLICT);
    expect(captured.body).toEqual({
      statusCode: HttpStatus.CONFLICT,
      error: ErrorCode.DELETION_BLOCKED,
      message: 'Blocked',
      blockers: ['ACTIVE_ORDERS'],
    });
  });

  it('maps a built-in NotFoundException to the generic NOT_FOUND code', () => {
    filter.catch(new NotFoundException('Resource missing'), makeHost(captured));

    expect(captured.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(captured.body?.error).toBe(ErrorCode.NOT_FOUND);
    expect(captured.body?.message).toBe('Resource missing');
  });

  it('maps built-in HTTP exceptions to their generic stable codes', () => {
    const cases: [HttpException, string, number][] = [
      [new BadRequestException(), ErrorCode.BAD_REQUEST, 400],
      [new UnauthorizedException(), ErrorCode.UNAUTHORIZED, 401],
      [new ForbiddenException(), ErrorCode.FORBIDDEN, 403],
      [new ConflictException(), ErrorCode.CONFLICT, 409],
    ];

    for (const [exception, expectedCode, expectedStatus] of cases) {
      const local: CapturedResponse = {};
      filter.catch(exception, makeHost(local));
      expect(local.statusCode).toBe(expectedStatus);
      expect(local.body?.error).toBe(expectedCode);
    }
  });

  it('preserves an explicit SCREAMING_SNAKE_CASE code from the payload', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      error: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: { messages: ['name should not be empty'] },
    });

    filter.catch(exception, makeHost(captured));

    expect(captured.statusCode).toBe(400);
    expect(captured.body?.error).toBe(ErrorCode.VALIDATION_ERROR);
    expect(captured.body?.message).toBe('Validation failed');
    expect(captured.body?.messages).toEqual(['name should not be empty']);
  });

  it('ignores Nest default error text and falls back to a status code', () => {
    // Nest's default payload uses `error: 'Bad Request'` (not a machine code).
    const exception = new BadRequestException(['field is required']);

    filter.catch(exception, makeHost(captured));

    expect(captured.body?.error).toBe(ErrorCode.BAD_REQUEST);
    expect(captured.body?.message).toBe('Validation failed');
    expect(captured.body?.messages).toEqual(['field is required']);
  });

  it('maps an unknown error to INTERNAL_ERROR without leaking internals', () => {
    filter.catch(new Error('secret stack detail'), makeHost(captured));

    expect(captured.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(captured.body).toEqual({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    });
  });

  it('maps a 500 HttpException to INTERNAL_ERROR', () => {
    filter.catch(new InternalServerErrorException(), makeHost(captured));

    expect(captured.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(captured.body?.error).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('handles a non-Error thrown value', () => {
    filter.catch('a thrown string', makeHost(captured));

    expect(captured.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(captured.body?.error).toBe(ErrorCode.INTERNAL_ERROR);
  });
});
