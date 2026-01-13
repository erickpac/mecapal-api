import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { IDeliveryOfferRepository } from '../../../domain/repositories/delivery-offer.repository';
import { DeliveryOffer } from '../../../domain/entities/delivery-offer.entity';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';

@Injectable()
export class GetOffersForRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
  ) {}

  async execute(requestId: string, clientId: string): Promise<DeliveryOffer[]> {
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    return this.deliveryOfferRepository.findByDeliveryRequestId(requestId);
  }
}
