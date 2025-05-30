import { User } from '../../../auth/domain/entities/user.entity';

export interface IProfileRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}
