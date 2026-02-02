import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CommissionType } from '@prisma/client';

export class CreateBillingProfileDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @IsNumber()
  @Min(0)
  commissionValue: number;

  @ValidateIf(
    (o: CreateBillingProfileDto) =>
      o.commissionType === CommissionType.PERCENTAGE,
  )
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionMinimum?: number;

  @ValidateIf(
    (o: CreateBillingProfileDto) =>
      o.commissionType === CommissionType.PERCENTAGE,
  )
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionMaximum?: number;

  @IsOptional()
  @IsBoolean()
  isCommissionExempt?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent: number;

  @IsOptional()
  @IsBoolean()
  isTaxExempt?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
