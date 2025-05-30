import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryImageService } from '../../../cloudinary/infrastructure/services/cloudinary-image.service';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { VehiclePhoto } from '../../domain/entities/vehicle-photo.entity';
import { VehiclePhotoRepository } from '../../infrastructure/repositories/vehicle-photo.repository';
import { VehiclePhotoResponseDto } from '../dtos/vehicle-photo-response.dto';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';

@Injectable()
export class UploadVehicleImageUseCase {
  constructor(
    private readonly vehiclePhotoRepository: VehiclePhotoRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  async execute(
    vehicleId: string,
    file: Buffer,
  ): Promise<VehiclePhotoResponseDto> {
    try {
      // Verify vehicle exists
      const vehicle = await this.vehicleRepository.findById(vehicleId);

      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
      }

      // Check if this is the first photo for the vehicle
      const existingPhotos =
        await this.vehiclePhotoRepository.findAll(vehicleId);
      const isMain = existingPhotos.length === 0;

      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: vehicleId,
        repository: this.vehiclePhotoRepository,
        imageBuffer: file,
        cloudinaryFolder: CLOUDINARY_FOLDERS.VEHICLES.MAIN,
        imageField: 'url',
        createNewEntity: true,
        additionalData: { isMain },
        responseTransformer: (entity: VehiclePhoto) =>
          VehiclePhotoResponseDto.fromEntity(entity),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
      }

      throw error;
    }
  }
}
