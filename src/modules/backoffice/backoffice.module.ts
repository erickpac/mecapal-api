import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { EmailModule } from '../email/email.module';
import { ValidationController } from './infrastructure/controllers/validation.controller';
import { UserManagementController } from './infrastructure/controllers/user-management.controller';
import { ValidationRepository } from './infrastructure/repositories/validation.repository';
import { UserManagementRepository } from './infrastructure/repositories/user-management.repository';
import { BACKOFFICE_TOKENS } from './domain/constants/injection-tokens';
import { GetPendingValidationsUseCase } from './application/use-cases/get-pending-validations.use-case';
import { GetVehicleValidationDetailsUseCase } from './application/use-cases/get-vehicle-validation-details.use-case';
import { GetProfileValidationDetailsUseCase } from './application/use-cases/get-profile-validation-details.use-case';
import { ApproveVehicleUseCase } from './application/use-cases/approve-vehicle.use-case';
import { RejectVehicleUseCase } from './application/use-cases/reject-vehicle.use-case';
import { ApproveTransporterProfileUseCase } from './application/use-cases/approve-transporter-profile.use-case';
import { RejectTransporterProfileUseCase } from './application/use-cases/reject-transporter-profile.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';

@Module({
  imports: [PrismaModule, CognitoModule, EmailModule],
  controllers: [ValidationController, UserManagementController],
  providers: [
    // Repositories
    {
      provide: BACKOFFICE_TOKENS.IValidationRepository,
      useClass: ValidationRepository,
    },
    {
      provide: BACKOFFICE_TOKENS.IUserManagementRepository,
      useClass: UserManagementRepository,
    },
    // Use Cases
    GetPendingValidationsUseCase,
    GetVehicleValidationDetailsUseCase,
    GetProfileValidationDetailsUseCase,
    ApproveVehicleUseCase,
    RejectVehicleUseCase,
    ApproveTransporterProfileUseCase,
    RejectTransporterProfileUseCase,
    ListUsersUseCase,
  ],
})
export class BackofficeModule {}
