/**
 * Dependency Injection tokens for Auth module
 * These tokens are used to inject domain interfaces in the application layer
 */
export const AUTH_TOKENS = {
  IAuthRepository: 'IAuthRepository',
  ITokenService: 'ITokenService',
  IPasswordHasher: 'IPasswordHasher',
  IEmailService: 'IEmailService',
};
