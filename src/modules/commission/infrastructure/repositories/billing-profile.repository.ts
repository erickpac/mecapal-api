import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BillingProfileEntity } from '../../domain/entities';
import {
  IBillingProfileRepository,
  CreateBillingProfileData,
  UpdateBillingProfileData,
} from '../../domain/interfaces';

@Injectable()
export class BillingProfileRepository implements IBillingProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBillingProfileData): Promise<BillingProfileEntity> {
    // If this profile is being set as default, unset any existing default
    if (data.isDefault) {
      await this.prisma.billingProfile.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await this.prisma.billingProfile.create({
      data: {
        name: data.name,
        description: data.description,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
        commissionMinimum: data.commissionMinimum,
        commissionMaximum: data.commissionMaximum,
        isCommissionExempt: data.isCommissionExempt ?? false,
        taxPercent: data.taxPercent,
        isTaxExempt: data.isTaxExempt ?? false,
        isDefault: data.isDefault ?? false,
      },
    });

    return new BillingProfileEntity(profile);
  }

  async findById(id: string): Promise<BillingProfileEntity | null> {
    const profile = await this.prisma.billingProfile.findUnique({
      where: { id },
    });

    return profile ? new BillingProfileEntity(profile) : null;
  }

  async findByName(name: string): Promise<BillingProfileEntity | null> {
    const profile = await this.prisma.billingProfile.findUnique({
      where: { name },
    });

    return profile ? new BillingProfileEntity(profile) : null;
  }

  async findAll(isActive?: boolean): Promise<BillingProfileEntity[]> {
    const profiles = await this.prisma.billingProfile.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return profiles.map((p) => new BillingProfileEntity(p));
  }

  async findDefault(): Promise<BillingProfileEntity | null> {
    const profile = await this.prisma.billingProfile.findFirst({
      where: { isDefault: true, isActive: true },
    });

    return profile ? new BillingProfileEntity(profile) : null;
  }

  async update(
    id: string,
    data: UpdateBillingProfileData,
  ): Promise<BillingProfileEntity> {
    // If this profile is being set as default, unset any existing default
    if (data.isDefault === true) {
      await this.prisma.billingProfile.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const profile = await this.prisma.billingProfile.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.commissionType !== undefined && {
          commissionType: data.commissionType,
        }),
        ...(data.commissionValue !== undefined && {
          commissionValue: data.commissionValue,
        }),
        ...(data.commissionMinimum !== undefined && {
          commissionMinimum: data.commissionMinimum,
        }),
        ...(data.commissionMaximum !== undefined && {
          commissionMaximum: data.commissionMaximum,
        }),
        ...(data.isCommissionExempt !== undefined && {
          isCommissionExempt: data.isCommissionExempt,
        }),
        ...(data.taxPercent !== undefined && { taxPercent: data.taxPercent }),
        ...(data.isTaxExempt !== undefined && {
          isTaxExempt: data.isTaxExempt,
        }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return new BillingProfileEntity(profile);
  }

  async delete(id: string): Promise<void> {
    // Soft delete - mark as inactive instead of removing
    await this.prisma.billingProfile.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignToClient(clientId: string, profileId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: clientId },
      data: { billingProfileId: profileId },
    });
  }

  async removeFromClient(clientId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: clientId },
      data: { billingProfileId: null },
    });
  }

  async findByClientId(clientId: string): Promise<BillingProfileEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: { billingProfile: true },
    });

    if (!user?.billingProfile || !user.billingProfile.isActive) {
      return null;
    }

    return new BillingProfileEntity(user.billingProfile);
  }
}
