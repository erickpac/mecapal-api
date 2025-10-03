import { VehiclePhoto } from '../../domain/entities/vehicle-photo.entity';
import { VehiclePhotoResponseDto } from '../../application/dtos/responses/vehicle-photo-response.dto';

/**
 * Vehicle Photo Mapper
 * Converts VehiclePhoto domain entities to VehiclePhotoResponseDto for API responses.
 */
export class VehiclePhotoMapper {
  /**
   * Converts a VehiclePhoto domain entity to a VehiclePhotoResponseDto.
   * @param vehiclePhoto The VehiclePhoto domain entity.
   * @returns The VehiclePhotoResponseDto.
   */
  static toResponseDto(vehiclePhoto: VehiclePhoto): VehiclePhotoResponseDto {
    return {
      id: vehiclePhoto.id,
      url: vehiclePhoto.url,
      isMain: vehiclePhoto.isMain,
      vehicleId: vehiclePhoto.vehicleId,
      createdAt: vehiclePhoto.createdAt,
      updatedAt: vehiclePhoto.updatedAt,
    };
  }

  /**
   * Converts an array of VehiclePhoto domain entities to VehiclePhotoResponseDto array.
   * @param vehiclePhotos The array of VehiclePhoto domain entities.
   * @returns The array of VehiclePhotoResponseDto.
   */
  static toResponseDtoArray(
    vehiclePhotos: VehiclePhoto[],
  ): VehiclePhotoResponseDto[] {
    return vehiclePhotos.map((vehiclePhoto) =>
      VehiclePhotoMapper.toResponseDto(vehiclePhoto),
    );
  }
}
