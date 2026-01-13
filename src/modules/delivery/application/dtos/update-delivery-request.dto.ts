import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsInt,
  IsString,
} from 'class-validator';

export class UpdateDeliveryRequestDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  calculatedDistanceKm?: number;

  @IsNumber()
  @Min(0.1)
  @Max(10000)
  @IsOptional()
  estimatedWeightKg?: number;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  @IsOptional()
  estimatedVolumeM3?: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  packageDescription?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  declaredValue?: number;

  @IsBoolean()
  @IsOptional()
  isFragile?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresSignature?: boolean;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  specialInstructions?: string;

  @IsDateString()
  @IsOptional()
  pickupDate?: string;

  @IsString()
  @IsOptional()
  pickupTimeStart?: string;

  @IsString()
  @IsOptional()
  pickupTimeEnd?: string;

  @IsDateString()
  @IsOptional()
  deliveryDeadline?: string;

  @IsInt()
  @Min(30)
  @Max(1440)
  @IsOptional()
  offerWindowMinutes?: number;
}
