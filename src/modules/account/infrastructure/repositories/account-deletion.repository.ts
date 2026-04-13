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

  async collectPiiUrls(userId: string): Promise<string[]> {
    const [profile, vehicles, bankAccounts] = await Promise.all([
      this.prisma.transporterProfile.findUnique({
        where: { userId },
        select: {
          licenseFrontPhotoUrl: true,
          licenseBackPhotoUrl: true,
          idPhotoUrl: true,
          insuranceDocumentUrl: true,
        },
      }),
      this.prisma.vehicle.findMany({
        where: { userId },
        select: {
          frontPhotoUrl: true,
          rearPhotoUrl: true,
          sidePhotoUrl: true,
          interiorPhotoUrl: true,
          registrationDocUrl: true,
          insuranceDocUrl: true,
        },
      }),
      this.prisma.bankAccount.findMany({
        where: { transporterId: userId },
        select: { verificationDocUrl: true },
      }),
    ]);

    const urls: (string | null | undefined)[] = [
      profile?.licenseFrontPhotoUrl,
      profile?.licenseBackPhotoUrl,
      profile?.idPhotoUrl,
      profile?.insuranceDocumentUrl,
      ...vehicles.flatMap((v) => [
        v.frontPhotoUrl,
        v.rearPhotoUrl,
        v.sidePhotoUrl,
        v.interiorPhotoUrl,
        v.registrationDocUrl,
        v.insuranceDocUrl,
      ]),
      ...bankAccounts.map((b) => b.verificationDocUrl),
    ];

    return urls.filter(
      (u): u is string => typeof u === 'string' && u.length > 0,
    );
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

  /**
   * Anonymizes all personally identifiable information (PII) associated
   * with the user while preserving records required by Guatemalan tax law
   * (SAT retention) and audit history: settlements, orders, reviews,
   * incidents all stay intact, but the linked PII fields are scrubbed.
   *
   * Kept on purpose (non-PII or legally required):
   *   - User.id, User.cognitoSub (stable keys for historical joins)
   *   - User.role, ratings
   *   - Address: city, state (aggregate stats only)
   *   - Vehicle: brand, model, year, color (non-identifying specs)
   *   - BankAccount: bankName (settlement traceability)
   *   - Reviews / Incidents bodies (other users' content)
   */
  async finalizeDeletion(userId: string): Promise<void> {
    const anonymizedEmail = `deleted_${userId}@mecapal.local`;
    const redactedPlate = `REDACTED_${userId.slice(0, 8)}`;
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

      await tx.transporterProfile.updateMany({
        where: { userId },
        data: {
          licenseNumber: 'REDACTED',
          licenseFrontPhotoUrl: '',
          licenseBackPhotoUrl: '',
          idPhotoUrl: '',
          address: 'REDACTED',
          postalCode: 'REDACTED',
          insurancePolicy: 'REDACTED',
          insuranceDocumentUrl: '',
        },
      });

      await tx.address.updateMany({
        where: { userId },
        data: {
          alias: 'Dirección eliminada',
          street: 'REDACTED',
          postalCode: 'REDACTED',
          contactName: null,
          contactPhone: null,
          latitude: null,
          longitude: null,
        },
      });

      // Vehicles: licensePlate and vin have unique constraints, so we
      // suffix with a slice of the user id to keep them unique per user.
      const vehicles = await tx.vehicle.findMany({
        where: { userId },
        select: { id: true },
      });
      for (const v of vehicles) {
        await tx.vehicle.update({
          where: { id: v.id },
          data: {
            licensePlate: `${redactedPlate}_${v.id.slice(0, 8)}`,
            vin: `REDACTED_${v.id.slice(0, 13)}`,
            frontPhotoUrl: '',
            rearPhotoUrl: '',
            sidePhotoUrl: '',
            interiorPhotoUrl: '',
            registrationDocUrl: '',
            insuranceDocUrl: '',
          },
        });
      }

      await tx.bankAccount.updateMany({
        where: { transporterId: userId },
        data: {
          accountHolderName: 'REDACTED',
          accountNumber: 'REDACTED',
          accountNumberLast4: 'XXXX',
          verificationDocUrl: null,
          status: 'SUSPENDED',
        },
      });

      // Notifications are user-private and safe to drop entirely.
      await tx.notification.deleteMany({ where: { userId } });

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
