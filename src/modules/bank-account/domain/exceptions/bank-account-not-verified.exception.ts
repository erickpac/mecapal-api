import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class BankAccountNotVerifiedException extends DomainException {
  constructor(id: string) {
    super(
      `Bank account "${id}" is not verified and cannot be used for payouts`,
      ErrorCode.BANK_ACCOUNT_NOT_VERIFIED,
      HttpStatus.BAD_REQUEST,
    );
  }
}
