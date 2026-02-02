import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { BillingProfileEntity } from '../../domain/entities';
import { IBillingProfileRepository } from '../../domain/interfaces';

@Injectable()
export class GetBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(id: string): Promise<BillingProfileEntity> {
    const profile = await this.billingProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`Billing profile with ID ${id} not found`);
    }
    return profile;
  }
}
