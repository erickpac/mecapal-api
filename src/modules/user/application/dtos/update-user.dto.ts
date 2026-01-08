import { IsOptional, IsString, MinLength } from 'class-validator';

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

  // Client-specific
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  taxId?: string;
}
