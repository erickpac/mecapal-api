import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsEnum,
  IsUrl,
  IsDateString,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { LoadType } from '../../domain/enums/load-type.enum';

export class CreateVehicleDto {
  // Basic Info
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]-\d{3}[A-Z]{3}$/, {
    message: 'Invalid license plate format. Expected format: P-123ABC',
  })
  licensePlate: string;

  @IsString()
  @Length(17, 17, { message: 'VIN must be exactly 17 characters' })
  vin: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  // Capacity
  @IsEnum(LoadType)
  loadType: LoadType;

  @IsNumber()
  @Min(0)
  @Max(10000)
  maxWeightKg: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  maxVolumeM3: number;

  // Photos
  @IsUrl()
  frontPhotoUrl: string;

  @IsUrl()
  rearPhotoUrl: string;

  @IsUrl()
  sidePhotoUrl: string;

  @IsUrl()
  interiorPhotoUrl: string;

  // Documents
  @IsUrl()
  registrationDocUrl: string;

  @IsUrl()
  insuranceDocUrl: string;

  @IsDateString()
  insuranceExpiration: string;
}
