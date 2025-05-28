import { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '@prisma/client';

export const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCreateUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: UserRole.USER,
};

export const mockUpdateUserData = {
  name: 'Updated User',
  email: 'updated@example.com',
};
