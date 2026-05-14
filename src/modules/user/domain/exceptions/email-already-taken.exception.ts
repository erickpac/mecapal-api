import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class EmailAlreadyTakenException extends DomainException {
  constructor(email: string) {
    super(
      `Email ${email} is already taken`,
      ErrorCode.EMAIL_ALREADY_TAKEN,
      HttpStatus.CONFLICT,
    );
  }
}
