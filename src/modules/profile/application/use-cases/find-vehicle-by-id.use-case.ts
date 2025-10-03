import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class FindVehicleByIdUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }
}
