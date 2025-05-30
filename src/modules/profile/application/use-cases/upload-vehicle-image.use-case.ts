import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import { CloudinaryImageService } from '../../../cloudinary/infrastructure/services/cloudinary-image.service';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleResponseDto } from '../dtos/vehicle-response.dto';

@Injectable()
export class UploadVehicleImageUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly cloudinaryImageService: CloudinaryImageService,
  ) {}

  async execute(id: string, file: Buffer): Promise<VehicleResponseDto> {
    try {
      return await this.cloudinaryImageService.uploadEntityImage({
        entityId: id,
        repository: this.vehicleRepository,
        imageBuffer: file,
        cloudinaryFolder: CLOUDINARY_FOLDERS.VEHICLES.MAIN,
        imageField: 'photoUrl',
        responseTransformer: (entity: Vehicle) =>
          VehicleResponseDto.fromEntity(entity),
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(`Vehicle with ID ${id} not found`);
      }

      throw error;
    }
  }
}
