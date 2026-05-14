import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class OrderNotFoundException extends DomainException {
  constructor(orderId: string) {
    super(
      `Order with ID "${orderId}" not found`,
      ErrorCode.ORDER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
