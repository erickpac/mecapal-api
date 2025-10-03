import { Injectable, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string, data: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new VehicleNotFoundException(id);
    }

    return this.vehicleRepository.update(id, data);
  }
}
