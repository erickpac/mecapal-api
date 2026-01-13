import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryOfferRepository } from '../../../domain/repositories/delivery-offer.repository';
import { DeliveryOffer } from '../../../domain/entities/delivery-offer.entity';
import { DeliveryOfferStatus } from '../../../domain/enums/delivery-offer-status.enum';
import { DeliveryOfferNotFoundException } from '../../../domain/exceptions/delivery-offer-not-found.exception';
import { InvalidOfferStatusException } from '../../../domain/exceptions/invalid-offer-status.exception';

@Injectable()
export class CancelOfferUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
  ) {}

  async execute(
    offerId: string,
    transporterId: string,
  ): Promise<DeliveryOffer> {
    const offer = await this.deliveryOfferRepository.findById(offerId);

    if (!offer || offer.transporterId !== transporterId) {
      throw new DeliveryOfferNotFoundException(offerId);
    }

    if (offer.status !== DeliveryOfferStatus.PENDING) {
      throw new InvalidOfferStatusException(
        offer.status,
        DeliveryOfferStatus.PENDING,
      );
    }

    return this.deliveryOfferRepository.updateStatus(
      offerId,
      DeliveryOfferStatus.CANCELLED,
    );
  }
}
