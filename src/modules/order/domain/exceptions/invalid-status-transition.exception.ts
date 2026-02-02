import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../enums';

export class InvalidStatusTransitionException extends BadRequestException {
  constructor(fromStatus: OrderStatus, toStatus: OrderStatus) {
    super(
      `Invalid status transition from "${fromStatus}" to "${toStatus}"`,
    );
  }
}
