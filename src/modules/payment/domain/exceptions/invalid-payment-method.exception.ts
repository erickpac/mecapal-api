import { BadRequestException } from '@nestjs/common';

export class InvalidPaymentMethodException extends BadRequestException {
  constructor(reason: string) {
    super(`Invalid payment method: ${reason}`);
  }
}
