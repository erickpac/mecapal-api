import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class OfferWindowExpiredException extends DomainException {
  constructor(requestId: string) {
    super(
      `Offer window for delivery request ${requestId} has expired`,
      ErrorCode.OFFER_WINDOW_EXPIRED,
      HttpStatus.CONFLICT,
    );
  }
}
