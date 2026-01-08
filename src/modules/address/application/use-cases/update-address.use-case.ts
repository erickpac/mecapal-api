import { Injectable, Inject } from '@nestjs/common';
import { ADDRESS_TOKENS } from '../../domain/constants/injection-tokens';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { Address } from '../../domain/entities/address.entity';
import { AddressNotFoundException } from '../../domain/exceptions/address-not-found.exception';
import { UpdateAddressDto } from '../dtos/update-address.dto';

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    @Inject(ADDRESS_TOKENS.IAddressRepository)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(
    addressId: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      throw new AddressNotFoundException(addressId);
    }

    if (dto.isDefault === true && !address.isDefault) {
      await this.addressRepository.unsetDefaultForUser(userId);
    }

    return this.addressRepository.update(addressId, dto);
  }
}
