import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { PaymentMethodNotFoundException } from '../../domain/exceptions';

@Injectable()
export class SetDefaultPaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: string, paymentMethodId: string): Promise<void> {
    const paymentMethod =
      await this.paymentRepository.findPaymentMethodById(paymentMethodId);

    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new PaymentMethodNotFoundException(paymentMethodId);
    }

    await this.paymentRepository.setDefaultPaymentMethod(
      userId,
      paymentMethodId,
    );
  }
}
