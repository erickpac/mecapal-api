import { Injectable, NotFoundException } from '@nestjs/common';
import { VehiclePhotoRepository } from '../../infrastructure/repositories/vehicle-photo.repository';

@Injectable()
export class DeleteVehiclePhotoUseCase {
  constructor(
    private readonly vehiclePhotoRepository: VehiclePhotoRepository,
  ) {}

  async execute(vehicleId: string, photoId: string): Promise<void> {
    // Verify photo exists and belongs to the vehicle
    const photo = await this.vehiclePhotoRepository.findById(photoId);
    if (!photo || photo.vehicleId !== vehicleId) {
      throw new NotFoundException(
        `Photo with ID ${photoId} not found for this vehicle`,
      );
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
