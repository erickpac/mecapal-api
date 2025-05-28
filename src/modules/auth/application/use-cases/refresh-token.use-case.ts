import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const token = await this.refreshTokenRepository.findByToken(refreshToken);

      if (!token || token.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.authRepository.findById(token.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newRefreshToken = randomBytes(40).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      // Create new refresh token
      await this.refreshTokenRepository.create({
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      });

      // Delete old refresh token
      await this.refreshTokenRepository.deleteByToken(refreshToken);

      // Generate new access token
      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
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
