import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }
}
