import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { IStripeService } from '../../domain/interfaces/stripe.service';
import { PaymentMethodNotFoundException } from '../../domain/exceptions';

@Injectable()
export class DeletePaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_TOKENS.IStripeService)
    private readonly stripeService: IStripeService,
  ) {}

  async execute(userId: string, paymentMethodId: string): Promise<void> {
    const paymentMethod =
      await this.paymentRepository.findPaymentMethodById(paymentMethodId);

    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new PaymentMethodNotFoundException(paymentMethodId);
    }

    // Check if it's the only payment method
    const allMethods =
      await this.paymentRepository.findPaymentMethodsByUserId(userId);

    if (allMethods.length === 1) {
      throw new BadRequestException(
        'Cannot delete the only payment method. Add another method first.',
      );
    }

    // If deleting default, set another as default
    if (paymentMethod.isDefault) {
      const otherMethod = allMethods.find((m) => m.id !== paymentMethodId);
      if (otherMethod) {
        await this.paymentRepository.setDefaultPaymentMethod(
          userId,
          otherMethod.id,
        );
      }
    }

    // Detach from Stripe
    await this.stripeService.detachPaymentMethod(
      paymentMethod.stripePaymentMethodId,
    );

    // Delete from database
    await this.paymentRepository.deletePaymentMethod(paymentMethodId);
  }
}
