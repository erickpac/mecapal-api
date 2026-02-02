import { Inject, Injectable } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { IBillingProfileRepository } from '../../domain/interfaces';

@Injectable()
export class RemoveBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(clientId: string): Promise<void> {
    await this.billingProfileRepository.removeFromClient(clientId);
  }
}
