import { Injectable, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new VehicleNotFoundException(id);
    }

    await this.vehicleRepository.delete(id);
  }
}
