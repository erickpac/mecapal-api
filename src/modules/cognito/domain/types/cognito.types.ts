export interface CognitoTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface CognitoUser {
  sub: string;
  email: string;
  emailVerified: boolean;
}

export interface SignUpResult {
  userSub: string;
  userConfirmed: boolean;
}

export interface AdminSignInResult {
  tokens?: CognitoTokens;
  challengeName?: 'NEW_PASSWORD_REQUIRED';
  session?: string;
}

export interface AdminCreateUserResult {
  userSub: string;
}
