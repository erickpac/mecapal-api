import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsInt,
} from 'class-validator';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';

export class CreateDeliveryRequestDto {
  @IsEnum(LoadType)
  loadType: LoadType;

  @IsUUID()
  pickupAddressId: string;

  @IsUUID()
  deliveryAddressId: string;

  @IsNumber()
  @Min(0)
  calculatedDistanceKm: number;

  @IsNumber()
  @Min(0.1)
  @Max(10000)
  estimatedWeightKg: number;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  @IsOptional()
  estimatedVolumeM3?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  packageDescription: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  declaredValue?: number;

  @IsBoolean()
  isFragile: boolean;

  @IsBoolean()
  requiresSignature: boolean;

  @IsString()
  @MaxLength(300)
  @IsOptional()
  specialInstructions?: string;

  @IsDateString()
  pickupDate: string;

  @IsString()
  @IsNotEmpty()
  pickupTimeStart: string;

  @IsString()
  @IsNotEmpty()
  pickupTimeEnd: string;

  @IsDateString()
  deliveryDeadline: string;

  @IsInt()
  @Min(30)
  @Max(1440)
  offerWindowMinutes: number;
}
