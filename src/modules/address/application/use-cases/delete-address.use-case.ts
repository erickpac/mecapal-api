import { Injectable, Inject } from '@nestjs/common';
import { ADDRESS_TOKENS } from '../../domain/constants/injection-tokens';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { AddressNotFoundException } from '../../domain/exceptions/address-not-found.exception';
import { AddressInUseException } from '../../domain/exceptions/address-in-use.exception';

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject(ADDRESS_TOKENS.IAddressRepository)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(addressId: string, userId: string): Promise<void> {
    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new AddressNotFoundException(addressId);
    }

    // Check if address is in use by active delivery requests
    const isInUse =
      await this.addressRepository.isInUseByDeliveryRequest(addressId);
    if (isInUse) {
      throw new AddressInUseException(addressId);
    }

    await this.addressRepository.delete(addressId);
  }
}
