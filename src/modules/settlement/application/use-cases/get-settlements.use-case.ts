import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import {
  ISettlementRepository,
  SettlementFilters,
} from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';
import { SettlementQueryDto } from '../dtos';

@Injectable()
export class GetSettlementsUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(query: SettlementQueryDto): Promise<Settlement[]> {
    const filters: SettlementFilters = {
      status: query.status,
      transporterId: query.transporterId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };

    return this.settlementRepository.findByFilters(filters);
  }
}
