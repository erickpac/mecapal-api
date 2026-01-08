import { UserRole } from '../../../domain/enums/user-role.enum';

export class AuthUserDto {
  id: string;
  cognitoSub: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  user: AuthUserDto;
}
