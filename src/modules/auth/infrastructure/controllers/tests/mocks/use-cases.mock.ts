import { UserRole } from '@prisma/client';
import { RegisterUseCase } from '../../../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../../../../application/use-cases/change-password.use-case';
import { User } from '../../../../domain/entities/user.entity';
import { RegisterDto } from '../../../../application/dtos/register.dto';
import { LoginDto } from '../../../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../../../application/dtos/refresh-token.dto';
import { ChangePasswordDto } from '../../../../application/dtos/change-password.dto';

export const mockRegisterUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<RegisterUseCase>;

export const mockLoginUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<LoginUseCase>;

export const mockRefreshTokenUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<RefreshTokenUseCase>;

export const mockChangePasswordUseCase = {
  execute: jest.fn(),
} as unknown as jest.Mocked<ChangePasswordUseCase>;

export const registerDto: RegisterDto = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: UserRole.USER,
};

export const loginDto: LoginDto = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockUser: Omit<User, 'password'> = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
};

export const refreshTokenDto: RefreshTokenDto = {
  refresh_token: 'mock-refresh-token',
};

export const changePasswordDto: ChangePasswordDto = {
  current_password: 'oldPassword',
  new_password: 'newPassword',
};
