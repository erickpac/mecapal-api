import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../../application/dtos/responses/user-response.dto';
import { AuthResponseDto } from '../../application/dtos/responses/auth-response.dto';
import { TokenResponseDto } from '../../application/dtos/responses/token-response.dto';

/**
 * User Mapper
 * Maps domain entities to response DTOs
 * This ensures separation between domain and API layers
 */
export class UserMapper {
  /**
   * Maps User entity to UserResponseDto
   * Excludes sensitive information like password
   */
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Maps User entity to AuthResponseDto
   * Used for login and register responses
   */
  static toAuthResponseDto(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: this.toResponseDto(user),
    };
  }

  /**
   * Creates TokenResponseDto
   * Used for token refresh responses
   */
  static toTokenResponseDto(
    accessToken: string,
    refreshToken: string,
  ): TokenResponseDto {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
