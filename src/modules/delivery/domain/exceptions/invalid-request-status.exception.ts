import { DeliveryRequestStatus } from '../enums/delivery-request-status.enum';

export class InvalidRequestStatusException extends Error {
  constructor(
    currentStatus: DeliveryRequestStatus,
    expectedStatus: DeliveryRequestStatus | DeliveryRequestStatus[],
  ) {
    const expected = Array.isArray(expectedStatus)
      ? expectedStatus.join(' or ')
      : expectedStatus;
    super(`Invalid request status: ${currentStatus}. Expected: ${expected}`);
    this.name = 'InvalidRequestStatusException';
  }
}
