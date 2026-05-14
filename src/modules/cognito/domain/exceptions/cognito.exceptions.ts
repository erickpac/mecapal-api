import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

/**
 * Base class for all Cognito/auth domain exceptions.
 *
 * Extends the shared `DomainException` so every auth error is emitted
 * through the standardized contract by the global `GlobalExceptionFilter`
 * ({ statusCode, error: <code>, message }). The dedicated Cognito filter
 * is no longer needed.
 */
export class CognitoException extends DomainException {
  constructor(message: string, code: ErrorCode, httpStatus: HttpStatus) {
    super(message, code, httpStatus);
  }
}

export class UserNotConfirmedException extends CognitoException {
  constructor() {
    super(
      'User is not confirmed. Please verify your email.',
      ErrorCode.USER_NOT_CONFIRMED,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidCredentialsException extends CognitoException {
  constructor() {
    super(
      'Invalid email or password',
      ErrorCode.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UserAlreadyExistsException extends CognitoException {
  constructor() {
    super(
      'User with this email already exists',
      ErrorCode.USER_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidCodeException extends CognitoException {
  constructor() {
    super(
      'Invalid or expired verification code',
      ErrorCode.INVALID_CODE,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ExpiredCodeException extends CognitoException {
  constructor() {
    super(
      'Verification code has expired',
      ErrorCode.EXPIRED_CODE,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidPasswordException extends CognitoException {
  constructor(message = 'Password does not meet requirements') {
    super(message, ErrorCode.INVALID_PASSWORD, HttpStatus.BAD_REQUEST);
  }
}

export class UserNotFoundException extends CognitoException {
  constructor() {
    super('User not found', ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class InvalidTokenException extends CognitoException {
  constructor() {
    super(
      'Invalid or expired token',
      ErrorCode.INVALID_TOKEN,
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UnauthorizedRoleException extends CognitoException {
  constructor() {
    super(
      'User role is not authorized for this application',
      ErrorCode.UNAUTHORIZED_ROLE,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class NewPasswordRequiredException extends CognitoException {
  constructor(public readonly session: string) {
    super(
      'New password required',
      ErrorCode.NEW_PASSWORD_REQUIRED,
      HttpStatus.BAD_REQUEST,
    );
  }

  get details(): Record<string, unknown> {
    return { session: this.session };
  }
}

export class CognitoRateLimitedException extends CognitoException {
  constructor(
    message = 'Too many attempts. Please try again in a few minutes.',
  ) {
    super(message, ErrorCode.RATE_LIMITED, HttpStatus.TOO_MANY_REQUESTS);
  }
}
