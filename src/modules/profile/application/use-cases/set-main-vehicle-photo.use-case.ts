import { Injectable } from '@nestjs/common';
import { VehiclePhotoRepository } from '../../infrastructure/repositories/vehicle-photo.repository';

@Injectable()
export class SetMainVehiclePhotoUseCase {
  constructor(
    private readonly vehiclePhotoRepository: VehiclePhotoRepository,
  ) {}

  async execute(vehicleId: string, photoId: string): Promise<void> {
    await this.vehiclePhotoRepository.setMainPhoto(vehicleId, photoId);
  }
}
