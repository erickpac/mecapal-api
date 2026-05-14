import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class OrderNotCompletedException extends DomainException {
  constructor() {
    super(
      'You can only review completed orders',
      ErrorCode.ORDER_NOT_COMPLETED,
      HttpStatus.BAD_REQUEST,
    );
  }
}
