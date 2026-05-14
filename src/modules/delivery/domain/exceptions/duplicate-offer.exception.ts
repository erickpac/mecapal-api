import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class DuplicateOfferException extends DomainException {
  constructor(requestId: string) {
    super(
      `You already have an offer for delivery request ${requestId}`,
      ErrorCode.DUPLICATE_OFFER,
      HttpStatus.CONFLICT,
    );
  }
}
