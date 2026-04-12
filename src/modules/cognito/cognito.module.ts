import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { COGNITO_TOKENS } from './domain/constants/injection-tokens';
import { CognitoService } from './infrastructure/services/cognito.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { CognitoAuthGuard } from './infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { TransporterStatusGuard } from './infrastructure/guards/transporter-status.guard';
import { CognitoExceptionFilter } from './infrastructure/filters/cognito-exception.filter';
import { CognitoRateLimitFilter } from './infrastructure/filters/cognito-rate-limit.filter';
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
    // Exception Filter
    {
      provide: APP_FILTER,
      useClass: CognitoRateLimitFilter,
    },
    {
      provide: APP_FILTER,
      useClass: CognitoExceptionFilter,
    },
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
