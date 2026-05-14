import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class AddressLimitExceededException extends DomainException {
  constructor(limit: number) {
    super(
      `Maximum number of addresses (${limit}) has been reached`,
      ErrorCode.ADDRESS_LIMIT_EXCEEDED,
      HttpStatus.CONFLICT,
    );
  }
}
