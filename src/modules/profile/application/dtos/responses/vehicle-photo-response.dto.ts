/**
 * Vehicle Photo Response DTO
 * Represents vehicle photo data in API responses
 */
export class VehiclePhotoResponseDto {
  id: string;
  url: string;
  isMain: boolean;
  vehicleId: string;
  createdAt: Date;
  updatedAt: Date;
}
