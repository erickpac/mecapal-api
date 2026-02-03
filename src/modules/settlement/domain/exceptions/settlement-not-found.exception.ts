import { NotFoundException } from '@nestjs/common';

export class SettlementNotFoundException extends NotFoundException {
  constructor(id?: string) {
    super(id ? `Settlement with ID ${id} not found` : 'Settlement not found');
  }
}
