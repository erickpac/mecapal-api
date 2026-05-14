import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class InvalidReviewTargetException extends DomainException {
  constructor() {
    super(
      'You cannot review this order',
      ErrorCode.INVALID_REVIEW_TARGET,
      HttpStatus.BAD_REQUEST,
    );
  }
}
