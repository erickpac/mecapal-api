import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.vehicleRepository.delete(id);
  }
}
