import { UserRole } from '../../../domain/enums/user-role.enum';

export class SignUpResponseDto {
  user: {
    id: string;
    cognitoSub: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    countryCode: string;
    companyName: string | null;
    taxId: string | null;
  };
  message: string;
}
