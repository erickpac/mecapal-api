import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class AddressNotFoundException extends DomainException {
  constructor(addressId: string) {
    super(
      `Address with ID ${addressId} not found`,
      ErrorCode.ADDRESS_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
