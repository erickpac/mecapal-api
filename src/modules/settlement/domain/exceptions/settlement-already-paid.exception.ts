import { ConflictException } from '@nestjs/common';

export class SettlementAlreadyPaidException extends ConflictException {
  constructor() {
    super('Settlement has already been paid');
  }
}
