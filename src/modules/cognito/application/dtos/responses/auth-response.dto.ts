import { UserRole } from '../../../domain/enums/user-role.enum';

export class AuthUserDto {
  id: string;
  cognitoSub: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyName: string | null;
  taxId: string | null;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  user: AuthUserDto;
}
