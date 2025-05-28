import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { env } from '../../../../config/env.config';
import * as crypto from 'crypto';
import { RefreshTokenPayload } from '../../domain/types/refresh-token-payload.type';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    this.logger.log('Attempting to refresh token');

    try {
      // Verify the refresh token
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret: env.JWT_REFRESH_SECRET,
        },
      );

      const user = await this.authRepository.findById(payload.sub);

      if (!user) {
        this.logger.warn(
          `Token refresh failed: User not found - ID: ${payload.sub}`,
        );
        throw new UnauthorizedException('User not found');
      }

      this.logger.log(`Refreshing tokens for user: ${user.email}`);

      // Generate new tokens
      const accessTokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const refreshTokenPayload: RefreshTokenPayload = {
        sub: user.id,
        type: 'refresh',
        jti: crypto.randomUUID(), // Add a unique token ID
      };

      const newAccessToken =
        await this.jwtService.signAsync(accessTokenPayload);
      const newRefreshToken = await this.jwtService.signAsync(
        refreshTokenPayload,
        {
          secret: env.JWT_REFRESH_SECRET,
          expiresIn: env.JWT_REFRESH_EXPIRATION_TIME,
        },
      );

      this.logger.log(`Tokens refreshed successfully for user: ${user.email}`);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Token refresh failed: Invalid refresh token');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
