import { RefreshToken } from '../entities/refresh-token.entity';

export abstract class IRefreshTokenRepository {
  abstract create(
    token: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RefreshToken>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteByToken(token: string): Promise<void>;
}
