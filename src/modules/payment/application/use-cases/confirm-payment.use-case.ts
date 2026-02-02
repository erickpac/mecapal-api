import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PAYMENT_TOKENS } from '../../domain/constants';
import { IPaymentRepository } from '../../domain/interfaces/payment.repository';
import { IStripeService } from '../../domain/interfaces/stripe.service';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums';
import {
  TransactionNotFoundException,
  PaymentFailedException,
} from '../../domain/exceptions';
import { DELIVERY_TOKENS } from '../../../delivery/domain/constants';
import { IDeliveryOfferRepository } from '../../../delivery/domain/repositories/delivery-offer.repository';
import { IDeliveryRequestRepository } from '../../../delivery/domain/repositories/delivery-request.repository';
import { DeliveryOfferStatus } from '../../../delivery/domain/enums/delivery-offer-status.enum';
import { DeliveryRequestStatus } from '../../../delivery/domain/enums/delivery-request-status.enum';
import { ConfirmPaymentDto } from '../dtos';

@Injectable()
export class ConfirmPaymentUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_TOKENS.IStripeService)
    private readonly stripeService: IStripeService,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(userId: string, dto: ConfirmPaymentDto): Promise<Transaction> {
    // Find transaction
    const transaction =
      await this.paymentRepository.findTransactionByPaymentIntentId(
        dto.paymentIntentId,
      );

    if (!transaction) {
      throw new TransactionNotFoundException(dto.paymentIntentId);
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Transaction does not belong to you');
    }

    if (transaction.status === TransactionStatus.SUCCEEDED) {
      return transaction; // Already confirmed
    }

    // Confirm with Stripe
    const paymentIntent = await this.stripeService.confirmPaymentIntent(
      dto.paymentIntentId,
      dto.paymentMethodId,
    );

    // Update transaction based on Stripe status
    let newStatus: TransactionStatus;
    let failureCode: string | undefined;
    let failureMessage: string | undefined;

    switch (paymentIntent.status) {
      case 'succeeded':
        newStatus = TransactionStatus.SUCCEEDED;
        break;
      case 'processing':
        newStatus = TransactionStatus.PROCESSING;
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        newStatus = TransactionStatus.PENDING;
        break;
      case 'canceled':
        newStatus = TransactionStatus.CANCELLED;
        break;
      default:
        newStatus = TransactionStatus.FAILED;
        failureCode = paymentIntent.last_payment_error?.code;
        failureMessage = paymentIntent.last_payment_error?.message;
    }

    // Update transaction
    const updatedTransaction = await this.paymentRepository.updateTransaction(
      transaction.id,
      {
        status: newStatus,
        stripeChargeId: paymentIntent.latest_charge as string | undefined,
        failureCode,
        failureMessage,
      },
    );

    // If payment succeeded, update delivery offer and request
    if (newStatus === TransactionStatus.SUCCEEDED) {
      await this.handleSuccessfulPayment(transaction.deliveryOfferId);
    } else if (newStatus === TransactionStatus.FAILED) {
      throw new PaymentFailedException(
        failureMessage || 'Payment failed',
        failureCode,
      );
    }

    return updatedTransaction;
  }

  private async handleSuccessfulPayment(
    deliveryOfferId: string,
  ): Promise<void> {
    // Get the offer with its delivery request
    const offer =
      await this.deliveryOfferRepository.findByIdWithDetails(deliveryOfferId);

    if (!offer) return;

    // Update offer status to ACCEPTED
    await this.deliveryOfferRepository.updateStatus(
      deliveryOfferId,
      DeliveryOfferStatus.ACCEPTED,
    );

    // Update delivery request status to ACCEPTED
    await this.deliveryRequestRepository.updateStatus(
      offer.deliveryRequestId,
      DeliveryRequestStatus.ACCEPTED,
    );

    // Set accepted offer on request
    await this.deliveryRequestRepository.setAcceptedOffer(
      offer.deliveryRequestId,
      deliveryOfferId,
    );

    // Reject all other pending offers for this request
    await this.deliveryOfferRepository.updateManyStatus(
      offer.deliveryRequestId,
      deliveryOfferId,
      DeliveryOfferStatus.REJECTED,
    );
  }
}
