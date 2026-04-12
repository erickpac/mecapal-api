export class CognitoException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'CognitoException';
  }
}

export class UserNotConfirmedException extends CognitoException {
  constructor() {
    super(
      'User is not confirmed. Please verify your email.',
      'USER_NOT_CONFIRMED',
    );
  }
}

export class InvalidCredentialsException extends CognitoException {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class UserAlreadyExistsException extends CognitoException {
  constructor() {
    super('User with this email already exists', 'USER_ALREADY_EXISTS');
  }
}

export class InvalidCodeException extends CognitoException {
  constructor() {
    super('Invalid or expired verification code', 'INVALID_CODE');
  }
}

export class ExpiredCodeException extends CognitoException {
  constructor() {
    super('Verification code has expired', 'EXPIRED_CODE');
  }
}

export class InvalidPasswordException extends CognitoException {
  constructor(message = 'Password does not meet requirements') {
    super(message, 'INVALID_PASSWORD');
  }
}

export class UserNotFoundException extends CognitoException {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}

export class InvalidTokenException extends CognitoException {
  constructor() {
    super('Invalid or expired token', 'INVALID_TOKEN');
  }
}

export class UnauthorizedRoleException extends CognitoException {
  constructor() {
    super(
      'User role is not authorized for this application',
      'UNAUTHORIZED_ROLE',
    );
  }
}

export class NewPasswordRequiredException extends CognitoException {
  constructor(public readonly session: string) {
    super('New password required', 'NEW_PASSWORD_REQUIRED');
  }
}

export class CognitoRateLimitedException extends Error {
  constructor(
    message = 'Too many attempts. Please try again in a few minutes.',
  ) {
    super(message);
    this.name = 'CognitoRateLimitedException';
  }
}
