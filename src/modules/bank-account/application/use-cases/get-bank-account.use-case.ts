import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { BankAccountNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(
    id: string,
    transporterId: string,
    isAdmin: boolean = false,
  ): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findById(id);

    if (!bankAccount) {
      throw new BankAccountNotFoundException(id);
    }

    // Authorization check
    if (!isAdmin && bankAccount.transporterId !== transporterId) {
      throw new ForbiddenException('You do not have access to this bank account');
    }

    return bankAccount;
  }
}
