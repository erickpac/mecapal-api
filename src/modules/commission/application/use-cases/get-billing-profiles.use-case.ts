import { Inject, Injectable } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { BillingProfileEntity } from '../../domain/entities';
import { IBillingProfileRepository } from '../../domain/interfaces';

@Injectable()
export class GetBillingProfilesUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(isActive?: boolean): Promise<BillingProfileEntity[]> {
    return this.billingProfileRepository.findAll(isActive);
  }
}
