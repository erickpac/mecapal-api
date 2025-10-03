import { UserRole } from '../enums/user-role.enum';

/**
 * User entity
 * Represents a user in the domain
 */
export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
