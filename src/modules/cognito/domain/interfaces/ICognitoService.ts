import {
  CognitoTokens,
  CognitoUser,
  SignUpResult,
} from '../types/cognito.types';

export interface ICognitoService {
  signUp(email: string, password: string): Promise<SignUpResult>;
  confirmSignUp(email: string, code: string): Promise<void>;
  signIn(email: string, password: string): Promise<CognitoTokens>;
  refreshToken(refreshToken: string): Promise<CognitoTokens>;
  forgotPassword(email: string): Promise<void>;
  confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void>;
  changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void>;
  signOut(accessToken: string): Promise<void>;
  getUser(accessToken: string): Promise<CognitoUser>;
  verifyToken(token: string): Promise<CognitoUser>;
}
