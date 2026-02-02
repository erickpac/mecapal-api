import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { IBillingProfileRepository } from '../../domain/interfaces';

@Injectable()
export class DeleteBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.billingProfileRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Billing profile with ID ${id} not found`);
    }

    await this.billingProfileRepository.delete(id);
  }
}
