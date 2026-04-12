import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IAccountDeletionRepository,
  ScheduleDeletionInput,
  ScheduleDeletionResult,
} from '../../domain/interfaces/account-deletion-repository.interface';

@Injectable()
export class AccountDeletionRepository implements IAccountDeletionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async scheduleDeletion(
    input: ScheduleDeletionInput,
  ): Promise<ScheduleDeletionResult> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: input.userId },
        data: {
          deletionScheduledFor: input.scheduledFor,
          deletionReason: input.reason ?? null,
          deletionOtherReason: input.otherReason ?? null,
        },
      });

      await tx.accountDeletionAudit.create({
        data: {
          userId: input.userId,
          scheduledFor: input.scheduledFor,
          reason: input.reason ?? null,
          otherReason: input.otherReason ?? null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    });

    return { scheduledFor: input.scheduledFor };
  }

  async cancelDeletion(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          deletionScheduledFor: null,
          deletionReason: null,
          deletionOtherReason: null,
        },
      });

      const latest = await tx.accountDeletionAudit.findFirst({
        where: { userId, canceledAt: null, processedAt: null },
        orderBy: { requestedAt: 'desc' },
      });
      if (latest) {
        await tx.accountDeletionAudit.update({
          where: { id: latest.id },
          data: { canceledAt: new Date() },
        });
      }
    });
  }

  async getScheduledDeletion(userId: string): Promise<Date | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { deletionScheduledFor: true },
    });
    return user?.deletionScheduledFor ?? null;
  }

  async findDueDeletions(now: Date) {
    return this.prisma.user.findMany({
      where: {
        deletionScheduledFor: { lte: now },
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cognitoSub: true,
      },
    });
  }

  async finalizeDeletion(userId: string): Promise<void> {
    const anonymizedEmail = `deleted_${userId}@mecapal.local`;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          phone: 'REDACTED',
          firstName: 'Usuario',
          lastName: 'Eliminado',
          companyName: null,
          taxId: null,
          deletedAt: now,
        },
      });

      const latest = await tx.accountDeletionAudit.findFirst({
        where: { userId, processedAt: null, canceledAt: null },
        orderBy: { requestedAt: 'desc' },
      });
      if (latest) {
        await tx.accountDeletionAudit.update({
          where: { id: latest.id },
          data: { processedAt: now },
        });
      }
    });
  }
}
