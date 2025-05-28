import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'src/config/env.config';
import { RefreshTokenPayload } from '../../domain/types/refresh-token-payload.type';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly jwtService: JwtService) {}

  execute(refreshToken: string): void {
    try {
      // Verify the refresh token to ensure it's valid before logging out
      this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
