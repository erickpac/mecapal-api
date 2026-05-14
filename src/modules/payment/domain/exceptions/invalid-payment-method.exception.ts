import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class InvalidPaymentMethodException extends DomainException {
  constructor(reason: string) {
    super(
      `Invalid payment method: ${reason}`,
      ErrorCode.INVALID_PAYMENT_METHOD,
      HttpStatus.BAD_REQUEST,
    );
  }
}
