import {
  IsEmail,
  IsString,
  Length,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
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

  // ISO 3166 country code (defaults to 'GT' when omitted)
  // Transformed to uppercase so the FK to Country.code (uppercase) holds.
  @Transform(({ value }: { value: string | undefined }) => value?.toUpperCase())
  @IsString()
  @Length(2, 3)
  @IsOptional()
  country?: string;
}
