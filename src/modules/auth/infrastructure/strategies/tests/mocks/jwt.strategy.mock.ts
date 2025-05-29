import { UserRole } from '@prisma/client';
import { User } from '../../../../domain/entities/user.entity';

export const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPayload = {
  sub: '1',
  email: 'test@example.com',
  role: UserRole.USER,
};
