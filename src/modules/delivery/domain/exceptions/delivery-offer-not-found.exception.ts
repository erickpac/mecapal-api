import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class DeliveryOfferNotFoundException extends DomainException {
  constructor(offerId: string) {
    super(
      `Delivery offer with ID ${offerId} not found`,
      ErrorCode.DELIVERY_OFFER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
