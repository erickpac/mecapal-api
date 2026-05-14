import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class PaymentMethodNotFoundException extends DomainException {
  constructor(id: string) {
    super(
      `Payment method with ID "${id}" not found`,
      ErrorCode.PAYMENT_METHOD_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
