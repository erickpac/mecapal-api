import { BadRequestException } from '@nestjs/common';

export class OrderNotCompletedException extends BadRequestException {
  constructor() {
    super('You can only review completed orders');
  }
}
