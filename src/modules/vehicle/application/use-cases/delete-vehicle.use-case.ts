import { Injectable, Inject } from '@nestjs/common';
import { VEHICLE_TOKENS } from '../../domain/constants/injection-tokens';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { VehicleInUseException } from '../../domain/exceptions/vehicle-in-use.exception';

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

    // Check if vehicle is in use by active delivery offers
    const isInUse =
      await this.vehicleRepository.isInUseByDeliveryOffer(vehicleId);
    if (isInUse) {
      throw new VehicleInUseException(vehicleId);
    }

    await this.vehicleRepository.delete(vehicleId);
  }
}
