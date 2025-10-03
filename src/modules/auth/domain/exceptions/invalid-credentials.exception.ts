/**
 * Exception thrown when authentication fails due to invalid credentials
 */
export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid credentials provided');
    this.name = 'InvalidCredentialsException';
  }
}
