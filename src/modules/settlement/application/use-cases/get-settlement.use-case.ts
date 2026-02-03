import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import { ISettlementRepository } from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';
import { SettlementNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetSettlementUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(id: string): Promise<Settlement> {
    const settlement = await this.settlementRepository.findById(id);

    if (!settlement) {
      throw new SettlementNotFoundException(id);
    }

    return settlement;
  }
}
