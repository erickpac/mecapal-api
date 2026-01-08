import { UserRole } from '../enums/user-role.enum';

export class User {
  id: string;
  cognitoSub: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
