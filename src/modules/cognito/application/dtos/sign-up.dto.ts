import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  Equals,
} from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // Client-specific
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  // Legal: must be true. Second safety belt over the mobile gate.
  @IsBoolean()
  @Equals(true, { message: 'acceptedTerms must be true' })
  acceptedTerms: boolean;
}
