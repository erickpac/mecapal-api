import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class DeliveryRequestNotFoundException extends DomainException {
  constructor(requestId: string) {
    super(
      `Delivery request with ID ${requestId} not found`,
      ErrorCode.DELIVERY_REQUEST_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
