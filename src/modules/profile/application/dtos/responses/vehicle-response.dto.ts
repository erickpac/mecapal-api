import { VehicleType } from '../../../domain/enums/vehicle-type.enum';

/**
 * Vehicle Response DTO
 * Represents vehicle data in API responses
 */
export class VehicleResponseDto {
  id: string;
  type: VehicleType;
  capacityKg: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
