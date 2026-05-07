import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { TransporterProfile } from '../../domain/entities/transporter-profile.entity';
import { TransporterStatus } from '../../domain/enums/transporter-status.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User({
      ...user,
      role: user.role as UserRole,
    });
  }

  async findByIdWithProfile(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { transporterProfile: true },
    });

    if (!user) return null;

    return new User({
      ...user,
      role: user.role as UserRole,
      transporterProfile: user.transporterProfile
        ? new TransporterProfile({
            ...user.transporterProfile,
            status: user.transporterProfile.status as TransporterStatus,
          })
        : null,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User({
      ...user,
      role: user.role as UserRole,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyName: data.companyName,
        taxId: data.taxId,
        profilePhotoUrl: data.profilePhotoUrl,
      },
    });

    return new User({
      ...user,
      role: user.role as UserRole,
    });
  }
}
