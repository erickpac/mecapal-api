import { DeliveryOfferStatus } from '../enums/delivery-offer-status.enum';

export class InvalidOfferStatusException extends Error {
  constructor(
    currentStatus: DeliveryOfferStatus,
    expectedStatus: DeliveryOfferStatus | DeliveryOfferStatus[],
  ) {
    const expected = Array.isArray(expectedStatus)
      ? expectedStatus.join(' or ')
      : expectedStatus;
    super(`Invalid offer status: ${currentStatus}. Expected: ${expected}`);
    this.name = 'InvalidOfferStatusException';
  }
}
