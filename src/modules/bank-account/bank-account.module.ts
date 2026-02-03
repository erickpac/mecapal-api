import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { BANK_ACCOUNT_TOKENS } from './domain/constants';
import { BankAccountRepository } from './infrastructure/repositories/bank-account.repository';
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
  imports: [PrismaModule, CognitoModule],
  controllers: [BankAccountController],
  providers: [
    // Repository
    {
      provide: BANK_ACCOUNT_TOKENS.IBankAccountRepository,
      useClass: BankAccountRepository,
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
