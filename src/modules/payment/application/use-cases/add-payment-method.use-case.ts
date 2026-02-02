import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { IStripeService } from '../../domain/interfaces/stripe.service';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { InvalidPaymentMethodException } from '../../domain/exceptions';
import { CardBrand } from '../../domain/enums';
import { AddPaymentMethodDto } from '../dtos';

@Injectable()
export class AddPaymentMethodUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_TOKENS.IStripeService)
    private readonly stripeService: IStripeService,
  ) {}

  async execute(
    userId: string,
    userEmail: string,
    userName: string,
    dto: AddPaymentMethodDto,
  ): Promise<PaymentMethod> {
    // Get or create Stripe customer
    let stripeCustomerId =
      await this.paymentRepository.getOrCreateStripeCustomerId(userId);

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        userEmail,
        userName,
      );
      stripeCustomerId = customer.id;
      await this.paymentRepository.updateStripeCustomerId(
        userId,
        stripeCustomerId,
      );
    }

    // Attach payment method to customer in Stripe
    const stripePaymentMethod = await this.stripeService.attachPaymentMethod({
      paymentMethodId: dto.paymentMethodId,
      customerId: stripeCustomerId,
    });

    if (!stripePaymentMethod.card) {
      throw new InvalidPaymentMethodException(
        'Only card payments are supported',
      );
    }

    // Check if user has any existing payment methods
    const existingMethods =
      await this.paymentRepository.findPaymentMethodsByUserId(userId);
    const isFirstMethod = existingMethods.length === 0;

    // Map Stripe card brand to our enum
    const cardBrand = this.mapCardBrand(stripePaymentMethod.card.brand);

    // Save to database
    const paymentMethod = await this.paymentRepository.createPaymentMethod(
      userId,
      {
        stripePaymentMethodId: stripePaymentMethod.id,
        stripeCustomerId,
        cardBrand,
        cardLast4: stripePaymentMethod.card.last4,
        cardExpMonth: stripePaymentMethod.card.exp_month,
        cardExpYear: stripePaymentMethod.card.exp_year,
        isDefault: isFirstMethod, // First method is default
      },
    );

    return paymentMethod;
  }

  private mapCardBrand(stripeBrand: string): CardBrand {
    const brandMap: Record<string, CardBrand> = {
      visa: CardBrand.VISA,
      mastercard: CardBrand.MASTERCARD,
      amex: CardBrand.AMEX,
      discover: CardBrand.DISCOVER,
    };
    return brandMap[stripeBrand.toLowerCase()] || CardBrand.OTHER;
  }
}
