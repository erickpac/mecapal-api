import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { env } from '../../../../config/env.config';
import * as crypto from 'crypto';
import { RefreshTokenPayload } from '../../domain/types/refresh-token-payload.type';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
        throw new UnauthorizedException('User not found');
      }

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

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
