import { Injectable, Inject } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { DuplicateBankAccountException } from '../../domain/exceptions';
import { CreateBankAccountDto } from '../dtos';

@Injectable()
export class CreateBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(
    transporterId: string,
    dto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    // Check for duplicates
    const exists = await this.bankAccountRepository.existsByAccountNumber(
      transporterId,
      dto.accountNumber,
    );

    if (exists) {
      throw new DuplicateBankAccountException();
    }

    // Extract last 4 characters (removing hyphens for display)
    const cleanAccountNumber = dto.accountNumber.replace(/-/g, '');
    const accountNumberLast4 = cleanAccountNumber.slice(-4);

    // Create the bank account
    const bankAccount = await this.bankAccountRepository.create(transporterId, {
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      accountType: dto.accountType,
      accountNumber: dto.accountNumber,
      accountNumberLast4,
      verificationDocUrl: dto.verificationDocUrl,
    });

    return bankAccount;
  }
}
