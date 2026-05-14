import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';
import { ACCOUNT_TOKENS } from './domain/constants/injection-tokens';
import { AccountController } from './infrastructure/controllers/account.controller';
import { AccountDeletionRepository } from './infrastructure/repositories/account-deletion.repository';
import { AccountDeletionBlockerService } from './infrastructure/services/account-deletion-blocker.service';
import { AccountDeletionScheduler } from './infrastructure/schedulers/account-deletion.scheduler';
import { PendingDeletionGuard } from './infrastructure/guards/pending-deletion.guard';
import { AccountStatusAdapter } from './infrastructure/adapters/account-status.adapter';
import { COGNITO_TOKENS } from '../cognito/domain/constants/injection-tokens';
import { RequestAccountDeletionUseCase } from './application/use-cases/request-account-deletion.use-case';
import { CancelAccountDeletionUseCase } from './application/use-cases/cancel-account-deletion.use-case';
import { ProcessScheduledDeletionsUseCase } from './application/use-cases/process-scheduled-deletions.use-case';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    CognitoModule,
    EmailModule,
    UploadModule,
  ],
  controllers: [AccountController],
  providers: [
    // Account deletion domain exceptions extend the shared `DomainException`
    // and are handled by the global `GlobalExceptionFilter` (AppModule).
    {
      provide: APP_GUARD,
      useClass: PendingDeletionGuard,
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
    ProcessScheduledDeletionsUseCase,
    AccountDeletionScheduler,
    {
      provide: COGNITO_TOKENS.IAccountStatusPort,
      useClass: AccountStatusAdapter,
    },
  ],
  exports: [
    ACCOUNT_TOKENS.IAccountDeletionRepository,
    ACCOUNT_TOKENS.IAccountDeletionBlockerService,
    COGNITO_TOKENS.IAccountStatusPort,
  ],
})
export class AccountModule {}
