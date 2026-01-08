import { Injectable, Inject } from '@nestjs/common';
import { VEHICLE_TOKENS } from '../../domain/constants/injection-tokens';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class GetVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(userId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.findByUserId(userId);
  }
}
