import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { ACCOUNT_TOKENS } from './domain/constants/injection-tokens';
import { AccountController } from './infrastructure/controllers/account.controller';
import { AccountDeletionRepository } from './infrastructure/repositories/account-deletion.repository';
import { AccountDeletionBlockerService } from './infrastructure/services/account-deletion-blocker.service';
import { AccountDeletionExceptionFilter } from './infrastructure/filters/account-deletion.filter';
import { RequestAccountDeletionUseCase } from './application/use-cases/request-account-deletion.use-case';
import { CancelAccountDeletionUseCase } from './application/use-cases/cancel-account-deletion.use-case';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [AccountController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AccountDeletionExceptionFilter,
    },
    {
      provide: ACCOUNT_TOKENS.IAccountDeletionRepository,
      useClass: AccountDeletionRepository,
    },
    {
      provide: ACCOUNT_TOKENS.IAccountDeletionBlockerService,
      useClass: AccountDeletionBlockerService,
    },
    RequestAccountDeletionUseCase,
    CancelAccountDeletionUseCase,
  ],
  exports: [
    ACCOUNT_TOKENS.IAccountDeletionRepository,
    ACCOUNT_TOKENS.IAccountDeletionBlockerService,
  ],
})
export class AccountModule {}
