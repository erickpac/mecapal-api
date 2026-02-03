import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import { ISettlementRepository } from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';

export interface TransporterEarnings {
  settlements: Settlement[];
  totalPending: number;
  totalPaid: number;
}

@Injectable()
export class GetTransporterEarningsUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(transporterId: string): Promise<TransporterEarnings> {
    const [settlements, totalPending, totalPaid] = await Promise.all([
      this.settlementRepository.findByTransporterId(transporterId),
      this.settlementRepository.getTotalPendingByTransporterId(transporterId),
      this.settlementRepository.getTotalPaidByTransporterId(transporterId),
    ]);

    return {
      settlements,
      totalPending,
      totalPaid,
    };
  }
}
