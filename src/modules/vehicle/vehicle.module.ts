import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { VehicleController } from './infrastructure/controllers/vehicle.controller';
import { VehicleRepository } from './infrastructure/repositories/vehicle.repository';
import { VEHICLE_TOKENS } from './domain/constants/injection-tokens';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { GetVehiclesUseCase } from './application/use-cases/get-vehicles.use-case';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [VehicleController],
  providers: [
    // Repository
    {
      provide: VEHICLE_TOKENS.IVehicleRepository,
      useClass: VehicleRepository,
    },
    // Use Cases
    CreateVehicleUseCase,
    GetVehiclesUseCase,
    GetVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [VEHICLE_TOKENS.IVehicleRepository],
})
export class VehicleModule {}
