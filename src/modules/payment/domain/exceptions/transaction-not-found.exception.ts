import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class TransactionNotFoundException extends DomainException {
  constructor(id: string) {
    super(
      `Transaction with ID "${id}" not found`,
      ErrorCode.TRANSACTION_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
