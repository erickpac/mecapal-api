import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { COMMISSION_INJECTION_TOKENS } from '../../domain/constants/injection-tokens';
import { BillingProfileEntity } from '../../domain/entities';
import { IBillingProfileRepository } from '../../domain/interfaces';
import { UpdateBillingProfileDto } from '../dtos';

@Injectable()
export class UpdateBillingProfileUseCase {
  constructor(
    @Inject(COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY)
    private readonly billingProfileRepository: IBillingProfileRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateBillingProfileDto,
  ): Promise<BillingProfileEntity> {
    const existing = await this.billingProfileRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Billing profile with ID ${id} not found`);
    }

    // Check if new name conflicts with another profile
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.billingProfileRepository.findByName(
        dto.name,
      );
      if (nameExists) {
        throw new ConflictException(
          `Billing profile with name "${dto.name}" already exists`,
        );
      }
    }

    return this.billingProfileRepository.update(id, dto);
  }
}
