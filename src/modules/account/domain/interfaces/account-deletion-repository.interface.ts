import { DeletionReason } from '@prisma/client';

export interface ScheduleDeletionInput {
  userId: string;
  scheduledFor: Date;
  reason?: DeletionReason;
  otherReason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ScheduleDeletionResult {
  scheduledFor: Date;
}

export interface IAccountDeletionRepository {
  scheduleDeletion(
    input: ScheduleDeletionInput,
  ): Promise<ScheduleDeletionResult>;
  cancelDeletion(userId: string): Promise<void>;
  getScheduledDeletion(userId: string): Promise<Date | null>;
}
