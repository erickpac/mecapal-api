import { IsEnum, IsNumber, Min } from 'class-validator';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';

export class CreateVehicleDto {
  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @Min(0)
  capacityKg: number;
}
