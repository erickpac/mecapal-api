import { Injectable, Inject } from '@nestjs/common';
import { IVehiclePhotoRepository } from '../../domain/repositories/vehicle-photo.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { VehiclePhotoNotFoundException } from '../../domain/exceptions/vehicle-photo-not-found.exception';

@Injectable()
export class DeleteVehiclePhotoUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehiclePhotoRepository)
    private readonly vehiclePhotoRepository: IVehiclePhotoRepository,
  ) {}

  async execute(vehicleId: string, photoId: string): Promise<void> {
    // Verify photo exists and belongs to the vehicle
    const photo = await this.vehiclePhotoRepository.findById(photoId);
    if (!photo || photo.vehicleId !== vehicleId) {
      throw new VehiclePhotoNotFoundException(photoId);
    }

    // If this is the main photo, we should prevent deletion
    if (photo.isMain) {
      throw new Error(
        'Cannot delete the main photo. Set another photo as main first.',
      );
    }

    await this.vehiclePhotoRepository.delete(photoId);
  }
}
