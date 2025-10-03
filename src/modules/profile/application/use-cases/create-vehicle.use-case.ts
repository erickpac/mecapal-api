import { Injectable, Logger, Inject } from '@nestjs/common';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { Vehicle } from '../../domain/entities/vehicle.entity';

@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);

  constructor(
    @Inject(PROFILE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    userId: string,
    createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    this.logger.log(`Creating vehicle for user ID: ${userId}`);

    const vehicle = await this.vehicleRepository.create(
      userId,
      createVehicleDto,
    );

    this.logger.log(`Vehicle created successfully with ID: ${vehicle.id}`);
    return vehicle;
  }
}
