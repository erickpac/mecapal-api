import { BadRequestException } from '@nestjs/common';

export class BankAccountNotVerifiedException extends BadRequestException {
  constructor(id: string) {
    super(
      `Bank account "${id}" is not verified and cannot be used for payouts`,
    );
  }
}
