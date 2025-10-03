import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { ITokenService } from '../../domain/services/token.service.interface';
import { AUTH_TOKENS } from '../../domain/constants/injection-tokens';
import * as crypto from 'crypto';
import { RefreshTokenPayload } from '../../domain/types/refresh-token-payload.type';
import { AccessTokenPayload } from '../../domain/types/access-token-payload.type';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

/**
 * Refresh Token Use Case
 * Handles token refresh and generation of new access/refresh tokens
 */
@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_TOKENS.IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(AUTH_TOKENS.ITokenService)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    this.logger.log('Attempting to refresh token');

    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);

      const user = await this.authRepository.findById(payload.sub);

      if (!user) {
        this.logger.warn(
          `Token refresh failed: User not found - ID: ${payload.sub}`,
        );
        throw new UserNotFoundException(payload.sub);
      }

      this.logger.log(`Refreshing tokens for user: ${user.email}`);

      const accessTokenPayload: AccessTokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const refreshTokenPayload: RefreshTokenPayload = {
        sub: user.id,
        type: 'refresh',
        jti: crypto.randomUUID(),
      };

      const newAccessToken =
        await this.tokenService.generateAccessToken(accessTokenPayload);
      const newRefreshToken =
        await this.tokenService.generateRefreshToken(refreshTokenPayload);

      this.logger.log(`Tokens refreshed successfully for user: ${user.email}`);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error: unknown) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof InvalidCredentialsException
      ) {
        throw error;
      }

      this.logger.error('Token refresh failed: Invalid refresh token');
      throw new InvalidCredentialsException();
    }
  }
}
