import { Injectable, Inject } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';

@Injectable()
export class GetBankAccountsUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(transporterId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.findByTransporterId(transporterId);
  }

  async getDefault(transporterId: string): Promise<BankAccount | null> {
    return this.bankAccountRepository.findDefaultByTransporterId(transporterId);
  }

  async getVerified(transporterId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.findVerifiedByTransporterId(transporterId);
  }
}
