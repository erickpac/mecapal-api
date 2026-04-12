import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  AuthFlowType,
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import {
  CognitoTokens,
  CognitoUser,
  SignUpResult,
  AdminSignInResult,
  AdminCreateUserResult,
} from '../../domain/types/cognito.types';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotConfirmedException,
  InvalidCodeException,
  ExpiredCodeException,
  InvalidPasswordException,
  UserNotFoundException,
  InvalidTokenException,
  ForgotPasswordRateLimitedException,
} from '../../domain/exceptions/cognito.exceptions';

@Injectable()
export class CognitoService implements ICognitoService {
  private readonly logger = new Logger(CognitoService.name);
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;
  private jwksClient: JwksClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    this.userPoolId = this.configService.getOrThrow<string>(
      'AWS_COGNITO_USER_POOL_ID',
    );
    this.clientId = this.configService.getOrThrow<string>(
      'AWS_COGNITO_CLIENT_ID',
    );

    this.client = new CognitoIdentityProviderClient({ region });

    this.jwksClient = new JwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${this.userPoolId}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
    });
  }

  async signUp(email: string, password: string): Promise<SignUpResult> {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      });

      const response = await this.client.send(command);

      return {
        userSub: response.UserSub ?? '',
        userConfirmed: response.UserConfirmed ?? false,
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
      });

      await this.client.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async signIn(email: string, password: string): Promise<CognitoTokens> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);
      const result = response.AuthenticationResult;

      if (!result) {
        throw new InvalidCredentialsException();
      }

      return {
        accessToken: result.AccessToken ?? '',
        refreshToken: result.RefreshToken ?? '',
        idToken: result.IdToken ?? '',
        expiresIn: result.ExpiresIn ?? 3600,
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async adminSignIn(
    email: string,
    password: string,
  ): Promise<AdminSignInResult> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: this.userPoolId,
        ClientId: this.clientId,
        AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);

      if (response.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
        return {
          challengeName: 'NEW_PASSWORD_REQUIRED',
          session: response.Session ?? '',
        };
      }

      const result = response.AuthenticationResult;

      if (!result) {
        throw new InvalidCredentialsException();
      }

      return {
        tokens: {
          accessToken: result.AccessToken ?? '',
          refreshToken: result.RefreshToken ?? '',
          idToken: result.IdToken ?? '',
          expiresIn: result.ExpiresIn ?? 3600,
        },
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async adminCreateUser(
    email: string,
    temporaryPassword?: string,
  ): Promise<AdminCreateUserResult> {
    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
        TemporaryPassword: temporaryPassword,
        DesiredDeliveryMediums: ['EMAIL'],
      });

      const response = await this.client.send(command);

      return {
        userSub:
          response.User?.Attributes?.find((a) => a.Name === 'sub')?.Value ?? '',
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async respondToNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string,
  ): Promise<CognitoTokens> {
    try {
      const command = new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
        Session: session,
        ChallengeResponses: {
          USERNAME: email,
          NEW_PASSWORD: newPassword,
        },
      });

      const response = await this.client.send(command);
      const result = response.AuthenticationResult;

      if (!result) {
        throw new InvalidCredentialsException();
      }

      return {
        accessToken: result.AccessToken ?? '',
        refreshToken: result.RefreshToken ?? '',
        idToken: result.IdToken ?? '',
        expiresIn: result.ExpiresIn ?? 3600,
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<CognitoTokens> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const response = await this.client.send(command);
      const result = response.AuthenticationResult;

      if (!result) {
        throw new InvalidTokenException();
      }

      return {
        accessToken: result.AccessToken ?? '',
        refreshToken: refreshToken, // Cognito doesn't return new refresh token
        idToken: result.IdToken ?? '',
        expiresIn: result.ExpiresIn ?? 3600,
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.client.send(command);
    } catch (error) {
      this.handleForgotPasswordError(error, email);
    }
  }

  private handleForgotPasswordError(error: unknown, email: string): void {
    const err = error as {
      name?: string;
      message?: string;
      $metadata?: { requestId?: string };
    };
    const emailHash = createHash('sha256').update(email).digest('hex');
    const requestId = err.$metadata?.requestId;

    const silentlyAbsorbed = new Set([
      'UserNotFoundException',
      'InvalidParameterException',
      'NotAuthorizedException',
      'CodeDeliveryFailureException',
    ]);

    if (err.name && silentlyAbsorbed.has(err.name)) {
      this.logger.warn(
        `forgotPassword absorbed ${err.name} (requestId=${requestId}, emailHash=${emailHash})`,
      );
      return;
    }

    if (
      err.name === 'LimitExceededException' ||
      err.name === 'TooManyRequestsException'
    ) {
      this.logger.warn(
        `forgotPassword rate limited ${err.name} (requestId=${requestId}, emailHash=${emailHash})`,
      );
      throw new ForgotPasswordRateLimitedException();
    }

    this.logger.error(
      `forgotPassword unexpected error ${err.name ?? 'Unknown'} (requestId=${requestId}, emailHash=${emailHash}): ${err.message ?? ''}`,
    );
    throw error;
  }

  async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await this.client.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      });

      await this.client.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.client.send(command);
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async getUser(accessToken: string): Promise<CognitoUser> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);

      const emailAttr = response.UserAttributes?.find(
        (attr) => attr.Name === 'email',
      );
      const emailVerifiedAttr = response.UserAttributes?.find(
        (attr) => attr.Name === 'email_verified',
      );

      return {
        sub: response.Username ?? '',
        email: emailAttr?.Value ?? '',
        emailVerified: emailVerifiedAttr?.Value === 'true',
      };
    } catch (error) {
      this.handleCognitoError(error);
    }
  }

  async verifyToken(token: string): Promise<CognitoUser> {
    try {
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || !decoded.header.kid) {
        throw new InvalidTokenException();
      }

      const key = await this.jwksClient.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();

      const payload = jwt.verify(token, signingKey, {
        issuer: `https://cognito-idp.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.userPoolId}`,
      }) as jwt.JwtPayload & { email?: string; email_verified?: boolean };

      return {
        sub: payload.sub ?? '',
        email: payload.email ?? '',
        emailVerified: payload.email_verified ?? false,
      };
    } catch (error) {
      if (error instanceof InvalidTokenException) {
        throw error;
      }
      throw new InvalidTokenException();
    }
  }

  private handleCognitoError(error: unknown): never {
    const cognitoError = error as { name?: string; message?: string };

    switch (cognitoError.name) {
      case 'UserNotFoundException':
        throw new UserNotFoundException();
      case 'NotAuthorizedException':
        throw new InvalidCredentialsException();
      case 'UserNotConfirmedException':
        throw new UserNotConfirmedException();
      case 'UsernameExistsException':
        throw new UserAlreadyExistsException();
      case 'CodeMismatchException':
        throw new InvalidCodeException();
      case 'ExpiredCodeException':
        throw new ExpiredCodeException();
      case 'InvalidPasswordException':
        throw new InvalidPasswordException(cognitoError.message);
      case 'InvalidParameterException':
        throw new InvalidPasswordException(cognitoError.message);
      default:
        throw error;
    }
  }
}
