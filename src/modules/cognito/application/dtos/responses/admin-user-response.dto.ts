import { UserRole } from '../../../domain/enums/user-role.enum';

export class AdminUserResponseDto {
  id: string;
  cognitoSub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
