import { Injectable, Inject } from '@nestjs/common';
import { ADDRESS_TOKENS } from '../../domain/constants/injection-tokens';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { Address } from '../../domain/entities/address.entity';

@Injectable()
export class GetAddressesUseCase {
  constructor(
    @Inject(ADDRESS_TOKENS.IAddressRepository)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(userId: string): Promise<Address[]> {
    return this.addressRepository.findByUserId(userId);
  }
}
