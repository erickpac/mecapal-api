import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: string): Promise<Transaction[]> {
    return this.paymentRepository.findTransactionsByUserId(userId);
  }
}
