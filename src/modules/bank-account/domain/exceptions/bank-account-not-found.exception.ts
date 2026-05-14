import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class BankAccountNotFoundException extends DomainException {
  constructor(id: string) {
    super(
      `Bank account with ID "${id}" not found`,
      ErrorCode.BANK_ACCOUNT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
