-- CreateEnum
CREATE TYPE "DeletionReason" AS ENUM ('NO_LONGER_USE', 'CREATED_ANOTHER_ACCOUNT', 'PRIVACY_CONCERNS', 'APP_ISSUES', 'BAD_EXPERIENCE', 'MISSING_FEATURES', 'PREFER_NOT_TO_SAY', 'OTHER');

-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletionScheduledFor" TIMESTAMP(3),
  ADD COLUMN "deletionReason" "DeletionReason",
  ADD COLUMN "deletionOtherReason" VARCHAR(500);

-- CreateIndex
CREATE INDEX "User_deletionScheduledFor_idx" ON "User"("deletionScheduledFor");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateTable
CREATE TABLE "AccountDeletionAudit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "reason" "DeletionReason",
    "otherReason" VARCHAR(500),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AccountDeletionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountDeletionAudit_userId_idx" ON "AccountDeletionAudit"("userId");

-- CreateIndex
CREATE INDEX "AccountDeletionAudit_processedAt_idx" ON "AccountDeletionAudit"("processedAt");

-- AddForeignKey
ALTER TABLE "AccountDeletionAudit" ADD CONSTRAINT "AccountDeletionAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
