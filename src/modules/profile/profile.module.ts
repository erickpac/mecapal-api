import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { ProfileRepository } from './infrastructure/repositories/profile.repository';
import { VehicleRepository } from './infrastructure/repositories/vehicle.repository';
import { VehiclePhotoRepository } from './infrastructure/repositories/vehicle-photo.repository';
import { TransporterProfileRepository } from './infrastructure/repositories/transporter-profile.repository';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { VehicleController } from './infrastructure/controllers/vehicle.controller';
import { TransporterController } from './infrastructure/controllers/transporter.controller';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from './application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from './application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { UploadVehicleImageUseCase } from './application/use-cases/upload-vehicle-image.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { SetMainVehiclePhotoUseCase } from './application/use-cases/set-main-vehicle-photo.use-case';
import { DeleteVehiclePhotoUseCase } from './application/use-cases/delete-vehicle-photo.use-case';
import { CompleteTransporterProfileUseCase } from './application/use-cases/complete-transporter-profile.use-case';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { PROFILE_TOKENS } from './domain/constants/injection-tokens';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [ProfileController, VehicleController, TransporterController],
  providers: [
    // Exception Filter
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // Repository implementations
    {
      provide: PROFILE_TOKENS.IProfileRepository,
      useClass: ProfileRepository,
    },
    {
      provide: PROFILE_TOKENS.IVehicleRepository,
      useClass: VehicleRepository,
    },
    {
      provide: PROFILE_TOKENS.IVehiclePhotoRepository,
      useClass: VehiclePhotoRepository,
    },
    {
      provide: PROFILE_TOKENS.ITransporterProfileRepository,
      useClass: TransporterProfileRepository,
    },
    // Use Cases
    GetProfileUseCase,
    UpdateProfileUseCase,
    CreateVehicleUseCase,
    FindAllVehiclesUseCase,
    FindVehicleByIdUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    UploadVehicleImageUseCase,
    SetMainVehiclePhotoUseCase,
    DeleteVehiclePhotoUseCase,
    CompleteTransporterProfileUseCase,
  ],
  exports: [PROFILE_TOKENS.IProfileRepository],
})
export class ProfileModule {}
