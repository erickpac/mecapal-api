import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';

@Injectable()
export class GetPaymentMethodsUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: string): Promise<PaymentMethod[]> {
    return this.paymentRepository.findPaymentMethodsByUserId(userId);
  }
}
