import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { BankAccountNotFoundException } from '../../domain/exceptions';
import { UpdateBankAccountDto } from '../dtos';

@Injectable()
export class UpdateBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(
    id: string,
    transporterId: string,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
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

    return this.bankAccountRepository.update(id, {
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      verificationDocUrl: dto.verificationDocUrl,
    });
  }
}
