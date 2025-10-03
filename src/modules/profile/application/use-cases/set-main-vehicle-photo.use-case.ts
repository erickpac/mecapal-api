import { Injectable, Inject } from '@nestjs/common';
import { IVehiclePhotoRepository } from '../../domain/repositories/vehicle-photo.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';

@Injectable()
export class SetMainVehiclePhotoUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehiclePhotoRepository)
    private readonly vehiclePhotoRepository: IVehiclePhotoRepository,
  ) {}

  async execute(vehicleId: string, photoId: string): Promise<void> {
    await this.vehiclePhotoRepository.setMainPhoto(vehicleId, photoId);
  }
}
