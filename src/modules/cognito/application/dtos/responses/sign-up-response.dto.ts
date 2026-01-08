import { UserRole } from '../../../domain/enums/user-role.enum';

export class SignUpResponseDto {
  user: {
    id: string;
    cognitoSub: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
  };
  message: string;
}
