import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class AddressInUseException extends DomainException {
  constructor(addressId: string) {
    super(
      `Cannot delete address ${addressId}: it is being used by active delivery requests`,
      ErrorCode.ADDRESS_IN_USE,
      HttpStatus.CONFLICT,
    );
  }
}
