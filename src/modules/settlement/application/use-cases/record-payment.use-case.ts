import { Injectable, Inject } from '@nestjs/common';
import { SETTLEMENT_TOKENS } from '../../domain/constants';
import { ISettlementRepository } from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';
import {
  SettlementNotFoundException,
  SettlementAlreadyPaidException,
} from '../../domain/exceptions';
import { RecordPaymentDto } from '../dtos';

@Injectable()
export class RecordPaymentUseCase {
  constructor(
    @Inject(SETTLEMENT_TOKENS.ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
  ) {}

  async execute(
    settlementId: string,
    adminId: string,
    dto: RecordPaymentDto,
  ): Promise<Settlement> {
    // Get the settlement
    const settlement = await this.settlementRepository.findById(settlementId);

    if (!settlement) {
      throw new SettlementNotFoundException(settlementId);
    }

    // Check if already paid
    if (settlement.isPaid()) {
      throw new SettlementAlreadyPaidException();
    }

    // Record the payment
    const updatedSettlement = await this.settlementRepository.recordPayment(
      settlementId,
      {
        transferDate: new Date(dto.transferDate),
        transactionNumber: dto.transactionNumber,
        comment: dto.comment,
        screenshotUrl: dto.screenshotUrl,
        bankAccountId: dto.bankAccountId,
        registeredBy: adminId,
      },
    );

    return updatedSettlement;
  }
}
