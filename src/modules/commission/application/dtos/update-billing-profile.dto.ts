import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { CommissionType } from '@prisma/client';

export class UpdateBillingProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsEnum(CommissionType)
  commissionType?: CommissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionMinimum?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionMaximum?: number | null;

  @IsOptional()
  @IsBoolean()
  isCommissionExempt?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @IsOptional()
  @IsBoolean()
  isTaxExempt?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
