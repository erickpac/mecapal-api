import { Injectable, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { IVehiclePhotoRepository } from '../../domain/repositories/vehicle-photo.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { ImageUploadFailedException } from '../../domain/exceptions/image-upload-failed.exception';
import { VehiclePhotoResponseDto } from '../dtos/vehicle-photo-response.dto';

// TODO: Replace with S3 - Cloudinary module removed
// import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
// import { CLOUDINARY_FOLDERS } from '../../../cloudinary/constants/cloudinary-folders';

@Injectable()
export class UploadVehicleImageUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehiclePhotoRepository)
    private readonly vehiclePhotoRepository: IVehiclePhotoRepository,
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
    // TODO: Replace with S3 - Inject S3 service here
    // private readonly cloudinaryService: CloudinaryService,
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

      // TODO: Replace with S3 - Validate and optimize image before upload
      // await this.cloudinaryService.validateImage(file);
      // const optimizedBuffer = await this.cloudinaryService.optimizeImage(file);

      // TODO: Replace with S3 - Upload image to S3
      // const uploadResult = await this.cloudinaryService.uploadImage(
      //   optimizedBuffer,
      //   CLOUDINARY_FOLDERS.VEHICLES.MAIN,
      // );
      // const imageUrl = uploadResult.secure_url;

      // Temporary placeholder - replace with actual S3 upload
      // Using file parameter to avoid unused variable warning
      const imageUrl = `https://placeholder-url-replace-with-s3.com/${file.byteLength}`;

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
