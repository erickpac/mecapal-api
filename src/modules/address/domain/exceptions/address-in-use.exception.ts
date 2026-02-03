import { ConflictException } from '@nestjs/common';

export class AddressInUseException extends ConflictException {
  constructor(addressId: string) {
    super(
      `Cannot delete address ${addressId}: it is being used by active delivery requests`,
    );
  }
}
