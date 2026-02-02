import { NotFoundException } from '@nestjs/common';

export class PaymentMethodNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Payment method with ID "${id}" not found`);
  }
}
