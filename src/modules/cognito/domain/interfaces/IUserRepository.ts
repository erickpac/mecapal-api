import { Prisma } from '@prisma/client';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByCognitoSub(cognitoSub: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
    tx?: Prisma.TransactionClient,
  ): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
}
