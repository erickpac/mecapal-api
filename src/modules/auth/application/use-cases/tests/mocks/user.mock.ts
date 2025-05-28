import { User } from '../../../../domain/entities/user.entity';
import { ChangePasswordDto } from '../../../dtos/change-password.dto';
import { LoginDto } from '../../../dtos/login.dto';
import { RegisterDto } from '../../../dtos/register.dto';

export const mockRegisterDto: RegisterDto = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'USER',
};

export const mockLoginDto: LoginDto = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  password: 'hashedPassword',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockChangePasswordDto: ChangePasswordDto = {
  current_password: 'currentPassword123',
  new_password: 'newPassword123',
};

export const mockRefreshToken = 'mock.refresh.token';

export const mockRefreshTokenPayload = {
  sub: '1',
  type: 'refresh',
  jti: 'mock-jti',
};
