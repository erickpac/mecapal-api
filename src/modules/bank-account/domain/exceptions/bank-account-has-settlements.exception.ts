import { ConflictException } from '@nestjs/common';

export class BankAccountHasSettlementsException extends ConflictException {
  constructor(bankAccountId: string) {
    super(
      `Cannot delete bank account ${bankAccountId}: it has been used for settlement payments`,
    );
  }
}
