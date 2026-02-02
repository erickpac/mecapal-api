import { Injectable, Inject } from '@nestjs/common';
import { BANK_ACCOUNT_TOKENS } from '../../domain/constants';
import { IBankAccountRepository, IEncryptionService } from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { DuplicateBankAccountException } from '../../domain/exceptions';
import { CreateBankAccountDto } from '../dtos';

@Injectable()
export class CreateBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_TOKENS.IBankAccountRepository)
    private readonly bankAccountRepository: IBankAccountRepository,
    @Inject(BANK_ACCOUNT_TOKENS.IEncryptionService)
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(
    transporterId: string,
    dto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    // Encrypt sensitive data
    const routingNumberEncrypted = this.encryptionService.encrypt(dto.routingNumber);
    const accountNumberEncrypted = this.encryptionService.encrypt(dto.accountNumber);

    // Check for duplicates
    const exists = await this.bankAccountRepository.existsByAccountNumber(
      transporterId,
      accountNumberEncrypted,
    );

    if (exists) {
      throw new DuplicateBankAccountException();
    }

    // Extract last 4 digits
    const routingNumberLast4 = dto.routingNumber.slice(-4);
    const accountNumberLast4 = dto.accountNumber.slice(-4);

    // Create the bank account
    const bankAccount = await this.bankAccountRepository.create(transporterId, {
      bankName: dto.bankName,
      accountHolderName: dto.accountHolderName,
      accountType: dto.accountType,
      routingNumberLast4,
      accountNumberLast4,
      routingNumberEncrypted,
      accountNumberEncrypted,
      verificationDocUrl: dto.verificationDocUrl,
    });

    return bankAccount;
  }
}
