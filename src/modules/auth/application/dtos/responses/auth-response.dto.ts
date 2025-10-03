import { UserResponseDto } from './user-response.dto';

/**
 * Authentication Response DTO
 * Represents authentication response with tokens and user data
 */
export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto;
}
