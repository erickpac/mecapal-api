import { NotFoundException } from '@nestjs/common';

export class BankAccountNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Bank account with ID "${id}" not found`);
  }
}
