import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';
import { OrderStatus } from '../enums';

export class InvalidOrderStatusException extends DomainException {
  constructor(currentStatus: OrderStatus, expectedStatuses: OrderStatus[]) {
    super(
      `Invalid order status. Current status is "${currentStatus}", expected one of: ${expectedStatuses.join(', ')}`,
      ErrorCode.INVALID_ORDER_STATUS,
      HttpStatus.BAD_REQUEST,
    );
  }
}
