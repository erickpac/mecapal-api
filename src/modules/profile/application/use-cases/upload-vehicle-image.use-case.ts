import { Injectable, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { IVehiclePhotoRepository } from '../../domain/repositories/vehicle-photo.repository';
import { IImageUploadService } from '../../domain/services/image-upload.service.interface';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { ImageUploadFailedException } from '../../domain/exceptions/image-upload-failed.exception';
import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';
import { VehiclePhotoResponseDto } from '../dtos/vehicle-photo-response.dto';

@Injectable()
export class UploadVehicleImageUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehiclePhotoRepository)
    private readonly vehiclePhotoRepository: IVehiclePhotoRepository,
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(PROFILE_TOKENS.IImageUploadService)
    private readonly imageUploadService: IImageUploadService,
  ) {}

  async execute(
    vehicleId: string,
    file: Buffer,
  ): Promise<VehiclePhotoResponseDto> {
    try {
      // Verify vehicle exists
      const vehicle = await this.vehicleRepository.findById(vehicleId);

      if (!vehicle) {
        throw new VehicleNotFoundException(vehicleId);
      }

      // Check if this is the first photo for the vehicle
      const existingPhotos =
        await this.vehiclePhotoRepository.findAll(vehicleId);
      const isMain = existingPhotos.length === 0;

      // Upload image to cloudinary
      const imageUrl = await this.imageUploadService.uploadImage(
        file,
        CLOUDINARY_FOLDERS.VEHICLES.MAIN,
      );

      // Create vehicle photo entity
      const vehiclePhoto = await this.vehiclePhotoRepository.create(vehicleId, {
        url: imageUrl,
        isMain,
      });

      return VehiclePhotoResponseDto.fromEntity(vehiclePhoto);
    } catch (error: unknown) {
      if (error instanceof VehicleNotFoundException) {
        throw error;
      }

      throw new ImageUploadFailedException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
