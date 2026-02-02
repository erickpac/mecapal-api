import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { IStripeService } from '../../domain/interfaces/stripe.service';
import { Transaction } from '../../domain/entities/transaction.entity';
import { PaymentMethodNotFoundException } from '../../domain/exceptions';
import { DELIVERY_TOKENS } from '../../../delivery/domain/constants';
import { IDeliveryOfferRepository } from '../../../delivery/domain/repositories/delivery-offer.repository';
import { DeliveryOfferNotFoundException } from '../../../delivery/domain/exceptions';
import { DeliveryOfferStatus } from '../../../delivery/domain/enums/delivery-offer-status.enum';
import { CreatePaymentIntentDto } from '../dtos';

export interface CreatePaymentIntentResult {
  transaction: Transaction;
  clientSecret: string;
}

@Injectable()
export class CreatePaymentIntentUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_TOKENS.IStripeService)
    private readonly stripeService: IStripeService,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
  ) {}

  async execute(
    userId: string,
    userEmail: string,
    userName: string,
    dto: CreatePaymentIntentDto,
  ): Promise<CreatePaymentIntentResult> {
    // Get the delivery offer
    const offer = await this.deliveryOfferRepository.findByIdWithDetails(
      dto.deliveryOfferId,
    );

    if (!offer) {
      throw new DeliveryOfferNotFoundException(dto.deliveryOfferId);
    }

    // Verify the offer belongs to a request from this client
    if (offer.deliveryRequest?.clientId !== userId) {
      throw new BadRequestException(
        'You can only pay for offers on your own delivery requests',
      );
    }

    // Verify offer status is PENDING (waiting to be accepted)
    if (offer.status !== DeliveryOfferStatus.PENDING) {
      throw new BadRequestException(
        `Cannot pay for offer with status "${offer.status}"`,
      );
    }

    // Check if already paid
    const existingTransaction =
      await this.paymentRepository.findTransactionByDeliveryOfferId(
        dto.deliveryOfferId,
      );

    if (existingTransaction) {
      throw new BadRequestException('This offer has already been paid for');
    }

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

    // Get payment method
    let paymentMethodId = dto.paymentMethodId;
    if (!paymentMethodId) {
      const defaultMethod =
        await this.paymentRepository.findDefaultPaymentMethod(userId);
      if (!defaultMethod) {
        throw new PaymentMethodNotFoundException('default');
      }
      paymentMethodId = defaultMethod.stripePaymentMethodId;
    } else {
      // Verify payment method belongs to user
      const methods =
        await this.paymentRepository.findPaymentMethodsByUserId(userId);
      const method = methods.find(
        (m) =>
          m.id === paymentMethodId ||
          m.stripePaymentMethodId === paymentMethodId,
      );
      if (!method) {
        throw new PaymentMethodNotFoundException(paymentMethodId);
      }
      paymentMethodId = method.stripePaymentMethodId;
    }

    // Amount in cents for Stripe
    const amountInCents = Math.round(offer.totalClientPrice * 100);

    // Create payment intent in Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      customerId: stripeCustomerId,
      paymentMethodId,
      metadata: {
        deliveryOfferId: dto.deliveryOfferId,
        userId,
      },
      description: `Payment for delivery offer ${dto.deliveryOfferId}`,
    });

    // Get payment method entity for DB reference
    const paymentMethodEntity = (
      await this.paymentRepository.findPaymentMethodsByUserId(userId)
    ).find((m) => m.stripePaymentMethodId === paymentMethodId);

    // Create transaction record
    const transaction = await this.paymentRepository.createTransaction(userId, {
      stripePaymentIntentId: paymentIntent.id,
      amount: offer.totalClientPrice,
      currency: 'USD',
      subtotal: offer.subtotal,
      commissionAmount: offer.commissionAmount,
      taxAmount: offer.taxAmount,
      paymentMethodId: paymentMethodEntity?.id,
      deliveryOfferId: dto.deliveryOfferId,
      metadata: {
        offeredPrice: offer.offeredPrice,
        transporterId: offer.transporterId,
      },
    });

    return {
      transaction,
      clientSecret: paymentIntent.client_secret!,
    };
  }
}
