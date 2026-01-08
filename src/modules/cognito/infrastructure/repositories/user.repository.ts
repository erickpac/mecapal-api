import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCognitoSub(cognitoSub: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { cognitoSub },
    });

    if (!user) return null;

    return new User({
      ...user,
      role: user.role as UserRole,
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

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        cognitoSub: userData.cognitoSub,
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        companyName: userData.companyName,
        taxId: userData.taxId,
      },
    });

    return new User({
      ...user,
      role: user.role as UserRole,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        companyName: data.companyName,
        taxId: data.taxId,
      },
    });

    return new User({
      ...user,
      role: user.role as UserRole,
    });
  }
}
