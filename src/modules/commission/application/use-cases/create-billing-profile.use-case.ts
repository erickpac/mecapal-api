import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { BillingProfileEntity } from '../../domain/entities';
import { IBillingProfileRepository } from '../../domain/interfaces';
import { CreateBillingProfileDto } from '../dtos';

@Injectable()
export class CreateBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(dto: CreateBillingProfileDto): Promise<BillingProfileEntity> {
    // Check if name already exists
    const existing = await this.billingProfileRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Billing profile with name "${dto.name}" already exists`,
      );
    }

    return this.billingProfileRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      commissionType: dto.commissionType,
      commissionValue: dto.commissionValue,
      commissionMinimum: dto.commissionMinimum ?? null,
      commissionMaximum: dto.commissionMaximum ?? null,
      isCommissionExempt: dto.isCommissionExempt ?? false,
      taxPercent: dto.taxPercent,
      isTaxExempt: dto.isTaxExempt ?? false,
      isDefault: dto.isDefault ?? false,
    });
  }
}
