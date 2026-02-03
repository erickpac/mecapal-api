import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import {
  BankAccountNotFoundException,
  BankAccountHasSettlementsException,
} from '../../domain/exceptions';

@Injectable()
export class DeleteBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(id: string, transporterId: string): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findById(id);

    if (!bankAccount) {
      throw new BankAccountNotFoundException(id);
    }

    // Authorization check
    if (bankAccount.transporterId !== transporterId) {
      throw new ForbiddenException(
        'You do not have access to this bank account',
      );
    }

    // Check if bank account has been used for settlements
    const hasSettlements = await this.bankAccountRepository.hasSettlements(id);
    if (hasSettlements) {
      throw new BankAccountHasSettlementsException(id);
    }

    await this.bankAccountRepository.delete(id);
  }
}
