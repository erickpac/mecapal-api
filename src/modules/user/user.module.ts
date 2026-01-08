import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { TransporterProfileRepository } from './infrastructure/repositories/transporter-profile.repository';
import { UserController } from './infrastructure/controllers/user.controller';
import { TransporterController } from './infrastructure/controllers/transporter.controller';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { CompleteTransporterProfileUseCase } from './application/use-cases/complete-transporter-profile.use-case';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { USER_TOKENS } from './domain/constants/injection-tokens';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [UserController, TransporterController],
  providers: [
    // Exception Filter
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
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
    CompleteTransporterProfileUseCase,
  ],
  exports: [USER_TOKENS.IUserRepository],
})
export class UserModule {}
