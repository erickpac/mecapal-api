import { UserRole } from '../../../domain/enums/user-role.enum';

/**
 * User Response DTO
 * Represents user data in API responses (without sensitive information)
 */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
