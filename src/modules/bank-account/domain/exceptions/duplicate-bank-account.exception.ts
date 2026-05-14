import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class DuplicateBankAccountException extends DomainException {
  constructor() {
    super(
      'A bank account with the same account number already exists',
      ErrorCode.DUPLICATE_BANK_ACCOUNT,
      HttpStatus.CONFLICT,
    );
  }
}
