import { Injectable, Inject } from '@nestjs/common';
import { VEHICLE_TOKENS } from '../../domain/constants/injection-tokens';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    vehicleId: string,
    userId: string,
    dto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle || vehicle.userId !== userId) {
      throw new VehicleNotFoundException(vehicleId);
    }

    const updateData = {
      ...dto,
      insuranceExpiration: dto.insuranceExpiration
        ? new Date(dto.insuranceExpiration)
        : undefined,
    };

    return this.vehicleRepository.update(vehicleId, updateData);
  }
}
