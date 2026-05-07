import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  phone?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  profilePhotoUrl?: string;

  // Transporter-specific
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  // Transporter-specific (DPI / national ID)
  @IsOptional()
  @IsString()
  @MinLength(5)
  idNumber?: string;
}
