import { VehiclePhoto } from '../../domain/entities/vehicle-photo.entity';

export class VehiclePhotoResponseDto {
  id: string;
  url: string;
  isMain: boolean;
  vehicleId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: VehiclePhoto): VehiclePhotoResponseDto {
    return {
      id: entity.id,
      url: entity.url,
      isMain: entity.isMain,
      vehicleId: entity.vehicleId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
