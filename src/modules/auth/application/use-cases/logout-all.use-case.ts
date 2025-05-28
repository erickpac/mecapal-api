import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }
}
