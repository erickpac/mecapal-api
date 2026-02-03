import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import { ISettlementRepository } from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';

@Injectable()
export class GetPendingSettlementsUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(): Promise<Settlement[]> {
    return this.settlementRepository.findPending();
  }
}
