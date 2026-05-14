import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';
import { DeliveryRequestStatus } from '../enums/delivery-request-status.enum';

export class InvalidRequestStatusException extends DomainException {
  constructor(
    currentStatus: DeliveryRequestStatus,
    expectedStatus: DeliveryRequestStatus | DeliveryRequestStatus[],
  ) {
    const expected = Array.isArray(expectedStatus)
      ? expectedStatus.join(' or ')
      : expectedStatus;
    super(
      `Invalid request status: ${currentStatus}. Expected: ${expected}`,
      ErrorCode.INVALID_REQUEST_STATUS,
      HttpStatus.CONFLICT,
    );
  }
}
