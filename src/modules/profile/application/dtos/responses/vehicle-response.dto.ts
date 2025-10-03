import { VehicleType } from '../../../domain/enums/vehicle-type.enum';
import { VehiclePhotoResponseDto } from './vehicle-photo-response.dto';

/**
 * Vehicle Response DTO
 * Represents vehicle data in API responses
 */
export class VehicleResponseDto {
  id: string;
  type: VehicleType;
  capacityKg: number;
  photos?: VehiclePhotoResponseDto[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
