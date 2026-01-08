import { UserRole } from '../enums/user-role.enum';
import { TransporterProfile } from '../../../user/domain/entities/transporter-profile.entity';

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
  transporterProfile?: TransporterProfile | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
