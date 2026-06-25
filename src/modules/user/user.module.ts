import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { UploadModule } from '../upload/upload.module';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { TransporterProfileRepository } from './infrastructure/repositories/transporter-profile.repository';
import { UserController } from './infrastructure/controllers/user.controller';
import { TransporterController } from './infrastructure/controllers/transporter.controller';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteProfilePhotoUseCase } from './application/use-cases/delete-profile-photo.use-case';
import { CompleteTransporterProfileUseCase } from './application/use-cases/complete-transporter-profile.use-case';
import { USER_TOKENS } from './domain/constants/injection-tokens';

@Module({
  imports: [PrismaModule, CognitoModule, UploadModule],
  controllers: [UserController, TransporterController],
  providers: [
    // Domain exceptions extend the shared `DomainException` and are handled
    // by the global `GlobalExceptionFilter` registered in AppModule.
    // Repository implementations
    {
      provide: USER_TOKENS.IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: USER_TOKENS.ITransporterProfileRepository,
      useClass: TransporterProfileRepository,
    },
    // Use Cases
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteProfilePhotoUseCase,
    CompleteTransporterProfileUseCase,
  ],
  exports: [USER_TOKENS.IUserRepository],
})
export class UserModule {}
