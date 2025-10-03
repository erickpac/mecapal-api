import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class FindAllVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(userId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll(userId);
  }
}
