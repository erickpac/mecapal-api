import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';
import { DeliveryOfferStatus } from '../enums/delivery-offer-status.enum';

export class InvalidOfferStatusException extends DomainException {
  constructor(
    currentStatus: DeliveryOfferStatus,
    expectedStatus: DeliveryOfferStatus | DeliveryOfferStatus[],
  ) {
    const expected = Array.isArray(expectedStatus)
      ? expectedStatus.join(' or ')
      : expectedStatus;
    super(
      `Invalid offer status: ${currentStatus}. Expected: ${expected}`,
      ErrorCode.INVALID_OFFER_STATUS,
      HttpStatus.CONFLICT,
    );
  }
}
