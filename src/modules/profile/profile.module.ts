import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProfileRepository } from './infrastructure/repositories/profile.repository';
import { VehicleRepository } from './infrastructure/repositories/vehicle.repository';
import { RouteRepository } from './infrastructure/repositories/route.repository';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { VehicleController } from './infrastructure/controllers/vehicle.controller';
import { RouteController } from './infrastructure/controllers/route.controller';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { CreateRouteUseCase } from './application/use-cases/create-route.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { DeleteRouteUseCase } from './application/use-cases/delete-route.use-case';
import { UpdateRouteUseCase } from './application/use-cases/update-route.use-case';
import { FindAllRoutesUseCase } from './application/use-cases/find-all-routes.use-case';
import { FindAllVehiclesUseCase } from './application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from './application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { FindRouteByIdUseCase } from './application/use-cases/find-route-by-id.use-case';
import { UploadVehicleImageUseCase } from './application/use-cases/upload-vehicle-image.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';

@Module({
  imports: [PrismaModule, CloudinaryModule],
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
    UploadVehicleImageUseCase,
  ],
  exports: [ProfileRepository],
})
export class ProfileModule {}
