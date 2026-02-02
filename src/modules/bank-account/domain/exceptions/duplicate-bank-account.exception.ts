import { ConflictException } from '@nestjs/common';

export class DuplicateBankAccountException extends ConflictException {
  constructor() {
    super('A bank account with the same account number already exists');
  }
}
