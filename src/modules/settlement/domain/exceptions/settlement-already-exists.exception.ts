import { ConflictException } from '@nestjs/common';

export class SettlementAlreadyExistsException extends ConflictException {
  constructor(orderId: string) {
    super(`Settlement already exists for order ${orderId}`);
  }
}
