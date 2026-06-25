import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateTermsAcceptanceData,
  ITermsAcceptanceRepository,
} from '../../domain/repositories/terms-acceptance.repository';

@Injectable()
export class TermsAcceptanceRepository implements ITermsAcceptanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateTermsAcceptanceData,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.termsAcceptance.create({
      data: {
        userId: data.userId,
        documentType: data.documentType,
        version: data.version,
      },
    });
  }
}
