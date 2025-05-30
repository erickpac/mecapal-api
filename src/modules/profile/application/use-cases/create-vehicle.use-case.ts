import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(
    userId: string,
    createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    this.logger.log(`Creating vehicle for user ID: ${userId}`);

    const vehicle = await this.vehicleRepository.create(
      userId,
      createVehicleDto,
    );

    return vehicle;
  }
}
