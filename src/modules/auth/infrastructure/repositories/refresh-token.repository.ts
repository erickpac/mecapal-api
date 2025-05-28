import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository extends IRefreshTokenRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaService: PrismaService) {
    super();
    this.prisma = prismaService as unknown as PrismaClient;
  }

  async create(
    token: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RefreshToken> {
    const createdToken = await this.prisma.refreshToken.create({
      data: token,
    });
    return new RefreshToken(createdToken as RefreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return refreshToken ? new RefreshToken(refreshToken as RefreshToken) : null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }
}
