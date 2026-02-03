import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import { ISettlementRepository } from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';
import { SettlementAlreadyExistsException } from '../../domain/exceptions';

@Injectable()
export class CreateSettlementUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(
    orderId: string,
    transporterId: string,
    amount: number,
  ): Promise<Settlement> {
    // Check if settlement already exists for this order
    const exists = await this.settlementRepository.existsByOrderId(orderId);
    if (exists) {
      throw new SettlementAlreadyExistsException(orderId);
    }

    // Create the settlement with PENDING status
    const settlement = await this.settlementRepository.create({
      orderId,
      transporterId,
      amount,
    });

    return settlement;
  }
}
