import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BANK_ACCOUNT_TOKENS } from './domain/constants';
import { BankAccountRepository } from './infrastructure/repositories/bank-account.repository';
import { EncryptionService } from './infrastructure/services/encryption.service';
import { BankAccountController } from './infrastructure/controllers/bank-account.controller';
import {
  CreateBankAccountUseCase,
  GetBankAccountsUseCase,
  GetBankAccountUseCase,
  UpdateBankAccountUseCase,
  SetDefaultBankAccountUseCase,
  DeleteBankAccountUseCase,
  VerifyBankAccountUseCase,
} from './application/use-cases';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [BankAccountController],
  providers: [
    // Repository
    {
      provide: BANK_ACCOUNT_TOKENS.IBankAccountRepository,
      useClass: BankAccountRepository,
    },
    // Encryption Service
    {
      provide: BANK_ACCOUNT_TOKENS.IEncryptionService,
      useClass: EncryptionService,
    },
    // Use Cases
    CreateBankAccountUseCase,
    GetBankAccountsUseCase,
    GetBankAccountUseCase,
    UpdateBankAccountUseCase,
    SetDefaultBankAccountUseCase,
    DeleteBankAccountUseCase,
    VerifyBankAccountUseCase,
  ],
  exports: [BANK_ACCOUNT_TOKENS.IBankAccountRepository],
})
export class BankAccountModule {}
