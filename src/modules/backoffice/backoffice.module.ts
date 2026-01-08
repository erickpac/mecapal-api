import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { ValidationController } from './infrastructure/controllers/validation.controller';
import { ValidationRepository } from './infrastructure/repositories/validation.repository';
import { BACKOFFICE_TOKENS } from './domain/constants/injection-tokens';
import { GetPendingValidationsUseCase } from './application/use-cases/get-pending-validations.use-case';
import { GetVehicleValidationDetailsUseCase } from './application/use-cases/get-vehicle-validation-details.use-case';
import { GetProfileValidationDetailsUseCase } from './application/use-cases/get-profile-validation-details.use-case';
import { ApproveVehicleUseCase } from './application/use-cases/approve-vehicle.use-case';
import { RejectVehicleUseCase } from './application/use-cases/reject-vehicle.use-case';
import { ApproveTransporterProfileUseCase } from './application/use-cases/approve-transporter-profile.use-case';
import { RejectTransporterProfileUseCase } from './application/use-cases/reject-transporter-profile.use-case';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [ValidationController],
  providers: [
    // Repository
    {
      provide: BACKOFFICE_TOKENS.IValidationRepository,
      useClass: ValidationRepository,
    },
    // Use Cases
    GetPendingValidationsUseCase,
    GetVehicleValidationDetailsUseCase,
    GetProfileValidationDetailsUseCase,
    ApproveVehicleUseCase,
    RejectVehicleUseCase,
    ApproveTransporterProfileUseCase,
    RejectTransporterProfileUseCase,
  ],
})
export class BackofficeModule {}
