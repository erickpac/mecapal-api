/**
 * Email service interface
 * Abstracts email sending operations for authentication purposes
 */
export interface IEmailService {
  sendPasswordRecovery(
    email: string,
    name: string,
    newPassword: string,
  ): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}
