import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class ReviewNotFoundException extends DomainException {
  constructor(id?: string) {
    super(
      id ? `Review with ID ${id} not found` : 'Review not found',
      ErrorCode.REVIEW_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
