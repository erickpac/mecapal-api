import { NotFoundException } from '@nestjs/common';

export class TransactionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Transaction with ID "${id}" not found`);
  }
}
