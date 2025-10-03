import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @Min(0)
  capacityKg: number;

  @IsString()
  photoUrl: string;
}
