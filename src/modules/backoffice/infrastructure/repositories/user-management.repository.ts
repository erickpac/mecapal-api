import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IUserManagementRepository,
  UserListQuery,
  UserListResult,
} from '../../domain/interfaces/user-management.repository';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';

@Injectable()
export class UserManagementRepository implements IUserManagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsers(query: UserListQuery): Promise<UserListResult> {
    const { role, search, sort, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      createdAt: sort === 'oldest' ? 'asc' : 'desc',
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          companyName: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        role: user.role as UserRole,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
