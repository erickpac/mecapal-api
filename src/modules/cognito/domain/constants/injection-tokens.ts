export const COGNITO_TOKENS = {
  ICognitoService: Symbol('ICognitoService'),
  IUserRepository: Symbol('IUserRepository'),
  /**
   * Optional port — implemented by the account module when the
   * account-deletion feature is enabled. Sign-in uses it to cancel a
   * pending deletion automatically.
   */
  IAccountStatusPort: Symbol('IAccountStatusPort'),
} as const;
