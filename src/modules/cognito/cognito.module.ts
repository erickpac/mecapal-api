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
import { AuthController } from './infrastructure/controllers/auth.controller';
import {
  SignUpUseCase,
  ConfirmSignUpUseCase,
  SignInUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ConfirmForgotPasswordUseCase,
  ChangePasswordUseCase,
  SignOutUseCase,
  GetUserUseCase,
} from './application/use-cases';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    // Exception Filter
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
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ConfirmForgotPasswordUseCase,
    ChangePasswordUseCase,
    SignOutUseCase,
    GetUserUseCase,
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
