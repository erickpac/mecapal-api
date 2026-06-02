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
  profilePhotoUrl: string | null;
  /**
   * When present, the account is in the grace period before permanent
   * deletion. Clients should surface a banner and offer a way to cancel.
   * `null` means no pending deletion.
   */
  deletionScheduledFor: Date | null;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  user: AuthUserDto;
}
