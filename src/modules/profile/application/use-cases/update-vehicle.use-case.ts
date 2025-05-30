import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string, data: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.vehicleRepository.update(id, data);
  }
}
