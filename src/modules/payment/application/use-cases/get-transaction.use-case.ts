import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: string, transactionId: string): Promise<Transaction> {
    const transaction =
      await this.paymentRepository.findTransactionById(transactionId);

    if (!transaction || transaction.userId !== userId) {
      throw new TransactionNotFoundException(transactionId);
    }

    return transaction;
  }
}
