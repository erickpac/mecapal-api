import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole.ADMIN | UserRole.BACKOFFICE;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  temporaryPassword?: string;
}
