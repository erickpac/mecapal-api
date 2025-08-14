import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone: string | null;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
