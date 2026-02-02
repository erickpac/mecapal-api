import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../enums';

export class InvalidOrderStatusException extends BadRequestException {
  constructor(currentStatus: OrderStatus, expectedStatuses: OrderStatus[]) {
    super(
      `Invalid order status. Current status is "${currentStatus}", expected one of: ${expectedStatuses.join(', ')}`,
    );
  }
}
