import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(
      `User with ID ${userId} not found`,
      ErrorCode.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
