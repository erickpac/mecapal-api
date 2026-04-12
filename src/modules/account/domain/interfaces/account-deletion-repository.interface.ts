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

export interface DueDeletionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cognitoSub: string;
}

export interface IAccountDeletionRepository {
  scheduleDeletion(
    input: ScheduleDeletionInput,
  ): Promise<ScheduleDeletionResult>;
  cancelDeletion(userId: string): Promise<void>;
  getScheduledDeletion(userId: string): Promise<Date | null>;
  findDueDeletions(now: Date): Promise<DueDeletionUser[]>;
  finalizeDeletion(userId: string): Promise<void>;
}
