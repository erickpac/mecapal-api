import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { IDeliveryOfferRepository } from '../../../domain/repositories/delivery-offer.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { DeliveryOfferStatus } from '../../../domain/enums/delivery-offer-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';
import { DeliveryOfferNotFoundException } from '../../../domain/exceptions/delivery-offer-not-found.exception';
import { InvalidRequestStatusException } from '../../../domain/exceptions/invalid-request-status.exception';
import { InvalidOfferStatusException } from '../../../domain/exceptions/invalid-offer-status.exception';
import { PrismaService } from '../../../../prisma/prisma.service';

const ACCEPTABLE_REQUEST_STATUSES = [
  DeliveryRequestStatus.PUBLISHED,
  DeliveryRequestStatus.OFFERS_RECEIVED,
];

@Injectable()
export class AcceptOfferUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    requestId: string,
    offerId: string,
    clientId: string,
  ): Promise<DeliveryRequest> {
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    if (!ACCEPTABLE_REQUEST_STATUSES.includes(request.status)) {
      throw new InvalidRequestStatusException(
        request.status,
        ACCEPTABLE_REQUEST_STATUSES,
      );
    }

    const offer = await this.deliveryOfferRepository.findById(offerId);

    if (!offer || offer.deliveryRequestId !== requestId) {
      throw new DeliveryOfferNotFoundException(offerId);
    }

    if (offer.status !== DeliveryOfferStatus.PENDING) {
      throw new InvalidOfferStatusException(
        offer.status,
        DeliveryOfferStatus.PENDING,
      );
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async () => {
      // Accept the selected offer
      await this.deliveryOfferRepository.updateStatus(
        offerId,
        DeliveryOfferStatus.ACCEPTED,
      );

      // Reject all other pending offers for this request
      await this.deliveryOfferRepository.updateManyStatus(
        requestId,
        offerId,
        DeliveryOfferStatus.REJECTED,
      );

      // Update request status and set accepted offer
      await this.deliveryRequestRepository.setAcceptedOffer(requestId, offerId);
      await this.deliveryRequestRepository.updateStatus(
        requestId,
        DeliveryRequestStatus.ACCEPTED,
      );
    });

    return this.deliveryRequestRepository.findByIdWithDetails(
      requestId,
    ) as Promise<DeliveryRequest>;
  }
}
