import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthRepository } from '@auth/domain/repositories/auth.repository';
import { RefreshTokenPayload } from '@auth/domain/types/refresh-token-payload.type';
import { AUTH_REPOSITORY_TOKEN } from '@auth/auth.module';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    this.logger.log('Attempting to refresh token');

    try {
      // Verify the refresh token
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET');

      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        { secret: refreshSecret },
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
        email: user.email,
        role: user.role,
        type: 'refresh',
        jti: crypto.randomUUID(),
      };

      const newAccessToken =
        await this.jwtService.signAsync(accessTokenPayload);

      const refreshExpiration =
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
      const newRefreshToken = await this.jwtService.signAsync(
        refreshTokenPayload,
        {
          secret: refreshSecret,
          expiresIn: refreshExpiration,
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
