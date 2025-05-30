import { Module } from '@nestjs/common';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ProfileRepository } from './infrastructure/repositories/profile.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { VehicleController } from './infrastructure/controllers/vehicle.controller';
import { RouteController } from './infrastructure/controllers/route.controller';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { VehicleRepository } from './infrastructure/repositories/vehicle.repository';
import { RouteRepository } from './infrastructure/repositories/route.repository';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindAllVehiclesUseCase } from './application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from './application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { FindRouteByIdUseCase } from './application/use-cases/find-route-by-id.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController, VehicleController, RouteController],
  providers: [
    GetProfileUseCase,
    UpdateProfileUseCase,
    CreateVehicleUseCase,
    CreateRouteUseCase,
    ProfileRepository,
    VehicleRepository,
    RouteRepository,
    FindAllVehiclesUseCase,
    FindVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    FindAllRoutesUseCase,
    FindRouteByIdUseCase,
    UpdateRouteUseCase,
    DeleteRouteUseCase,
    DeleteVehicleUseCase,
  ],
  exports: [ProfileRepository],
})
export class ProfileModule {}
