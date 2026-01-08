import { Injectable, Inject } from '@nestjs/common';
import { ADDRESS_TOKENS } from '../../domain/constants/injection-tokens';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { Address } from '../../domain/entities/address.entity';
import { AddressLimitExceededException } from '../../domain/exceptions/address-limit-exceeded.exception';
import { CreateAddressDto } from '../dtos/create-address.dto';

const MAX_ADDRESSES = 10;

@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject(ADDRESS_TOKENS.IAddressRepository)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string, dto: CreateAddressDto): Promise<Address> {
    const count = await this.addressRepository.countByUserId(userId);

    if (count >= MAX_ADDRESSES) {
      throw new AddressLimitExceededException(MAX_ADDRESSES);
    }

    const isFirstAddress = count === 0;
    const shouldBeDefault = dto.isDefault ?? isFirstAddress;

    if (shouldBeDefault && count > 0) {
      await this.addressRepository.unsetDefaultForUser(userId);
    }

    return this.addressRepository.create(userId, {
      ...dto,
      isDefault: shouldBeDefault,
    });
  }
}
