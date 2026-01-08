import { Injectable, Inject } from '@nestjs/common';
import { VEHICLE_TOKENS } from '../../domain/constants/injection-tokens';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(VEHICLE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(vehicleId: string, userId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle || vehicle.userId !== userId) {
      throw new VehicleNotFoundException(vehicleId);
    }

    await this.vehicleRepository.delete(vehicleId);
  }
}
