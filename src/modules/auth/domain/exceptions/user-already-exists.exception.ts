/**
 * Exception thrown when attempting to register a user with an email that already exists
 */
export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}
