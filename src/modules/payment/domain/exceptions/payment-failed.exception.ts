import { BadRequestException } from '@nestjs/common';

export class PaymentFailedException extends BadRequestException {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(`Payment failed: ${message}`);
  }
}
