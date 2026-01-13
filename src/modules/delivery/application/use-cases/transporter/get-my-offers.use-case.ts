import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import {
  IDeliveryOfferRepository,
  FindDeliveryOffersOptions,
} from '../../../domain/repositories/delivery-offer.repository';
import { DeliveryOffer } from '../../../domain/entities/delivery-offer.entity';

@Injectable()
export class GetMyOffersUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
  ) {}

  async execute(
    transporterId: string,
    options?: FindDeliveryOffersOptions,
  ): Promise<DeliveryOffer[]> {
    return this.deliveryOfferRepository.findByTransporterId(
      transporterId,
      options,
    );
  }
}
