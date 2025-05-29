import { User } from '../entities/user.entity';

export interface IAuthRepository {
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  createUser(email: string, hashedPassword: string): Promise<User>;
  saveRefreshToken(userId: string, token: string): Promise<void>;
  validateRefreshToken(userId: string, token: string): Promise<boolean>;
  removeRefreshToken(userId: string): Promise<void>;
}
