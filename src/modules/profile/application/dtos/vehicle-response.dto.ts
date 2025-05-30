import { VehicleType } from '@prisma/client';
import { Vehicle } from '../../domain/entities/vehicle.entity';

export class VehicleResponseDto {
  id: string;
  type: VehicleType;
  capacityKg: number;
  photoUrl: string;

  static fromEntity(entity: Vehicle): VehicleResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      capacityKg: entity.capacityKg,
      photoUrl: entity.photoUrl,
    };
  }
}
