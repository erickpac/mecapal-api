import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { BankAccountStatus } from '../../domain/enums';
import { BankAccountNotFoundException } from '../../domain/exceptions';
import { VerifyBankAccountDto } from '../dtos';

@Injectable()
export class VerifyBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
  ) {}

  async execute(id: string, dto: VerifyBankAccountDto): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findById(id);

    if (!bankAccount) {
      throw new BankAccountNotFoundException(id);
    }

    // Validate rejection reason is provided when rejecting
    if (dto.status === BankAccountStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting a bank account',
      );
    }

    return this.bankAccountRepository.verify(id, {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });
  }
}
