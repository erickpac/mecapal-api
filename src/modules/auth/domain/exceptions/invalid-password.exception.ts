/**
 * Exception thrown when the current password is incorrect during password change
 */
export class InvalidPasswordException extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'InvalidPasswordException';
  }
}
