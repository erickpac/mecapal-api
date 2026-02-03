import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { SETTLEMENT_TOKENS } from './domain/constants';
import { SettlementRepository } from './infrastructure/repositories/settlement.repository';
import { SettlementController } from './infrastructure/controllers/settlement.controller';
import {
  CreateSettlementUseCase,
  GetPendingSettlementsUseCase,
  GetSettlementUseCase,
  GetSettlementsUseCase,
  RecordPaymentUseCase,
  GetTransporterEarningsUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [SettlementController],
  providers: [
    // Repository
    {
      provide: SETTLEMENT_TOKENS.ISettlementRepository,
      useClass: SettlementRepository,
    },
    // Use Cases
    CreateSettlementUseCase,
    GetPendingSettlementsUseCase,
    GetSettlementUseCase,
    GetSettlementsUseCase,
    RecordPaymentUseCase,
    GetTransporterEarningsUseCase,
  ],
  exports: [SETTLEMENT_TOKENS.ISettlementRepository, CreateSettlementUseCase],
})
export class SettlementModule {}
