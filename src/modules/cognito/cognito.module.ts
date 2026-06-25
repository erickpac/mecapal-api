import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { USER_TOKENS } from '../user/domain/constants/injection-tokens';
import { TermsAcceptanceRepository } from '../user/infrastructure/repositories/terms-acceptance.repository';
import { COGNITO_TOKENS } from './domain/constants/injection-tokens';
import { CognitoService } from './infrastructure/services/cognito.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { CognitoAuthGuard } from './infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { TransporterStatusGuard } from './infrastructure/guards/transporter-status.guard';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AdminAuthController } from './infrastructure/controllers/admin-auth.controller';
import {
  SignUpUseCase,
  ConfirmSignUpUseCase,
  SignInUseCase,
  MobileSignInUseCase,
  AdminSignInUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ConfirmForgotPasswordUseCase,
  ChangePasswordUseCase,
  SignOutUseCase,
  GetUserUseCase,
  CreateAdminUserUseCase,
  CompleteNewPasswordUseCase,
} from './application/use-cases';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController, AdminAuthController],
  providers: [
    // Cognito/auth domain exceptions extend the shared `DomainException`
    // and are handled by the global `GlobalExceptionFilter` (AppModule).
    // Cognito Service
    {
      provide: COGNITO_TOKENS.ICognitoService,
      useClass: CognitoService,
    },
    // User Repository
    {
      provide: COGNITO_TOKENS.IUserRepository,
      useClass: UserRepository,
    },
    // Terms acceptance repo bound locally (only needs PrismaService).
    // Avoids a module-level dependency on UserModule, which would close a
    // Upload → Cognito → User → Upload cycle. This is a file import of the
    // class, not a Nest module import — no DI edge.
    {
      provide: USER_TOKENS.ITermsAcceptanceRepository,
      useClass: TermsAcceptanceRepository,
    },
    // Guards
    CognitoAuthGuard,
    RolesGuard,
    TransporterStatusGuard,
    // Use Cases
    SignUpUseCase,
    ConfirmSignUpUseCase,
    SignInUseCase,
    MobileSignInUseCase,
    AdminSignInUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ConfirmForgotPasswordUseCase,
    ChangePasswordUseCase,
    SignOutUseCase,
    GetUserUseCase,
    CreateAdminUserUseCase,
    CompleteNewPasswordUseCase,
  ],
  exports: [
    COGNITO_TOKENS.ICognitoService,
    COGNITO_TOKENS.IUserRepository,
    CognitoAuthGuard,
    RolesGuard,
    TransporterStatusGuard,
  ],
})
export class CognitoModule {}
