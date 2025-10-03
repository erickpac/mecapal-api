import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserRole as PrismaUserRole } from '@prisma/client';

/**
 * Auth Repository Implementation
 * Handles data persistence for authentication using Prisma
 * Maps between domain entities and Prisma models
 */
@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        ...user,
        role: user.role as PrismaUserRole,
      },
    });
    return this.mapToDomain(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData = data.role
      ? { ...data, role: data.role as PrismaUserRole }
      : data;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return this.mapToDomain(updatedUser);
  }

  private mapToDomain(prismaUser: {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string | null;
    role: PrismaUserRole;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      password: prismaUser.password,
      phone: prismaUser.phone,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
