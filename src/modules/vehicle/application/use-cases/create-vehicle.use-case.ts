import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { VEHICLE_TOKENS } from '../../domain/constants/injection-tokens';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleLimitExceededException } from '../../domain/exceptions/vehicle-limit-exceeded.exception';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';

const MAX_VEHICLES = 5;

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(userId: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const count = await this.vehicleRepository.countByUserId(userId);

    if (count >= MAX_VEHICLES) {
      throw new VehicleLimitExceededException(MAX_VEHICLES);
    }

    const [licensePlateExists, vinExists] = await Promise.all([
      this.vehicleRepository.existsByLicensePlate(dto.licensePlate),
      this.vehicleRepository.existsByVin(dto.vin),
    ]);

    if (licensePlateExists) {
      throw new ConflictException('License plate already registered');
    }

    if (vinExists) {
      throw new ConflictException('VIN already registered');
    }

    return this.vehicleRepository.create(userId, {
      ...dto,
      insuranceExpiration: new Date(dto.insuranceExpiration),
    });
  }
}
