import { Injectable, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class FindAllVehiclesUseCase {
  constructor(
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(userId: string): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll(userId);
  }
}
