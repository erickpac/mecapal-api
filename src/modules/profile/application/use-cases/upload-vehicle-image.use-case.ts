import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryImageService } from '../../../cloudinary/infrastructure/services/cloudinary-image.service';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { VehiclePhoto } from '../../domain/entities/vehicle-photo.entity';
import { VehiclePhotoRepository } from '../../infrastructure/repositories/vehicle-photo.repository';
import { VehiclePhotoResponseDto } from '../dtos/vehicle-photo-response.dto';

@Injectable()
export class UploadVehicleImageUseCase {
  constructor(
    private readonly vehiclePhotoRepository: VehiclePhotoRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  async execute(id: string, file: Buffer): Promise<VehiclePhotoResponseDto> {
    try {
      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: id,
        repository: this.vehiclePhotoRepository,
        imageBuffer: file,
        cloudinaryFolder: CLOUDINARY_FOLDERS.VEHICLES.MAIN,
        imageField: 'url',
        responseTransformer: (entity: VehiclePhoto) =>
          VehiclePhotoResponseDto.fromEntity(entity),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(`Vehicle with ID ${id} not found`);
      }

      throw error;
    }
  }
}
