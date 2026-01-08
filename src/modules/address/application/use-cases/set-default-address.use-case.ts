import { Injectable, Inject } from '@nestjs/common';
import { ADDRESS_TOKENS } from '../../domain/constants/injection-tokens';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { Address } from '../../domain/entities/address.entity';
import { AddressNotFoundException } from '../../domain/exceptions/address-not-found.exception';

@Injectable()
export class SetDefaultAddressUseCase {
  constructor(
    @Inject(ADDRESS_TOKENS.IAddressRepository)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(addressId: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new AddressNotFoundException(addressId);
    }

    return this.addressRepository.setDefault(addressId, userId);
  }
}
