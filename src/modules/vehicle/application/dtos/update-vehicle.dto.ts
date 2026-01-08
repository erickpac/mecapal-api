import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsUrl,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { LoadType } from '../../domain/enums/load-type.enum';

export class UpdateVehicleDto {
  // Basic Info (licensePlate and vin cannot be updated)
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  // Capacity
  @IsEnum(LoadType)
  @IsOptional()
  loadType?: LoadType;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @IsOptional()
  maxWeightKg?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxVolumeM3?: number;

  // Photos
  @IsUrl()
  @IsOptional()
  frontPhotoUrl?: string;

  @IsUrl()
  @IsOptional()
  rearPhotoUrl?: string;

  @IsUrl()
  @IsOptional()
  sidePhotoUrl?: string;

  @IsUrl()
  @IsOptional()
  interiorPhotoUrl?: string;

  // Documents
  @IsUrl()
  @IsOptional()
  registrationDocUrl?: string;

  @IsUrl()
  @IsOptional()
  insuranceDocUrl?: string;

  @IsDateString()
  @IsOptional()
  insuranceExpiration?: string;
}
