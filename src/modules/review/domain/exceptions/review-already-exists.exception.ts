import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class ReviewAlreadyExistsException extends DomainException {
  constructor() {
    super(
      'You have already submitted a review for this order',
      ErrorCode.REVIEW_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }
}
