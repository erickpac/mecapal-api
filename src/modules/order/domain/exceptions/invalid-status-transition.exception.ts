import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';
import { OrderStatus } from '../enums';

export class InvalidStatusTransitionException extends DomainException {
  constructor(fromStatus: OrderStatus, toStatus: OrderStatus) {
    super(
      `Invalid status transition from "${fromStatus}" to "${toStatus}"`,
      ErrorCode.INVALID_STATUS_TRANSITION,
      HttpStatus.BAD_REQUEST,
    );
  }
}
