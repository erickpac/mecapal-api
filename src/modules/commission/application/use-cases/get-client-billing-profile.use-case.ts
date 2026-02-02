import { Inject, Injectable } from '@nestjs/common';
import { CommissionType } from '@prisma/client';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { BillingProfileEntity } from '../../domain/entities';
import { IBillingProfileRepository } from '../../domain/interfaces';

export interface ClientBillingResult {
  profile: BillingProfileEntity | null;
  commissionType: CommissionType;
  commissionValue: number;
  commissionMinimum: number | null;
  commissionMaximum: number | null;
  isCommissionExempt: boolean;
  taxPercent: number;
  isTaxExempt: boolean;
  calculateCommission: (offeredPrice: number) => number;
  calculateTax: (subtotal: number) => number;
}

// Default billing configuration (15% commission, no tax)
const DEFAULT_BILLING: ClientBillingResult = {
  profile: null,
  commissionType: CommissionType.PERCENTAGE,
  commissionValue: 15,
  commissionMinimum: null,
  commissionMaximum: null,
  isCommissionExempt: false,
  taxPercent: 0,
  isTaxExempt: false,
  calculateCommission: (offeredPrice: number) => (offeredPrice * 15) / 100,
  calculateTax: () => 0,
};

@Injectable()
export class GetClientBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(clientId: string): Promise<ClientBillingResult> {
    // Try to find client's assigned profile
    let profile = await this.billingProfileRepository.findByClientId(clientId);

    // If no profile assigned, try to find default profile
    if (!profile) {
      profile = await this.billingProfileRepository.findDefault();
    }

    // If no profile at all, return default billing
    if (!profile) {
      return DEFAULT_BILLING;
    }

    return {
      profile,
      commissionType: profile.commissionType,
      commissionValue: profile.commissionValue,
      commissionMinimum: profile.commissionMinimum,
      commissionMaximum: profile.commissionMaximum,
      isCommissionExempt: profile.isCommissionExempt,
      taxPercent: profile.taxPercent,
      isTaxExempt: profile.isTaxExempt,
      calculateCommission: (offeredPrice: number) =>
        profile.calculateCommission(offeredPrice),
      calculateTax: (subtotal: number) => profile.calculateTax(subtotal),
    };
  }
}
