import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class BankAccountHasSettlementsException extends DomainException {
  constructor(bankAccountId: string) {
    super(
      `Cannot delete bank account ${bankAccountId}: it has been used for settlement payments`,
      ErrorCode.BANK_ACCOUNT_HAS_SETTLEMENTS,
      HttpStatus.CONFLICT,
    );
  }
}
