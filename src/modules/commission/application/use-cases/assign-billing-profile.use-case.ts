import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { IBillingProfileRepository } from '../../domain/interfaces';

@Injectable()
export class AssignBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(clientId: string, profileId: string): Promise<void> {
    // Verify profile exists
    const profile = await this.billingProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundException(
        `Billing profile with ID ${profileId} not found`,
      );
    }

    await this.billingProfileRepository.assignToClient(clientId, profileId);
  }
}
