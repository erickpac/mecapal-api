import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ITransporterProfileRepository,
  CreateTransporterProfileData,
  UpdateTransporterProfileData,
} from '../../domain/repositories/transporter-profile.repository';
import { TransporterProfile } from '../../domain/entities/transporter-profile.entity';
import { TransporterStatus } from '../../domain/enums/transporter-status.enum';

@Injectable()
export class TransporterProfileRepository implements ITransporterProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: CreateTransporterProfileData,
  ): Promise<TransporterProfile> {
    const profile = await this.prisma.transporterProfile.create({
      data: {
        userId,
        ...data,
      },
    });

    return new TransporterProfile({
      ...profile,
      status: profile.status as TransporterStatus,
    });
  }

  async findByUserId(userId: string): Promise<TransporterProfile | null> {
    const profile = await this.prisma.transporterProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    return new TransporterProfile({
      ...profile,
      status: profile.status as TransporterStatus,
    });
  }

  async update(
    userId: string,
    data: UpdateTransporterProfileData,
  ): Promise<TransporterProfile> {
    const profile = await this.prisma.transporterProfile.update({
      where: { userId },
      data,
    });

    return new TransporterProfile({
      ...profile,
      status: profile.status as TransporterStatus,
    });
  }
}
