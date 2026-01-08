import { UserRole } from '../enums/user-role.enum';

export class User {
  id: string;
  cognitoSub: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName: string | null;
  taxId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
