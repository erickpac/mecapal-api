import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';
import { InvalidRequestStatusException } from '../../../domain/exceptions/invalid-request-status.exception';

@Injectable()
export class PublishDeliveryRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(requestId: string, clientId: string): Promise<DeliveryRequest> {
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    if (request.status !== DeliveryRequestStatus.DRAFT) {
      throw new InvalidRequestStatusException(
        request.status,
        DeliveryRequestStatus.DRAFT,
      );
    }

    // Update offer expiration time when publishing
    const offerExpiresAt = new Date();
    offerExpiresAt.setMinutes(
      offerExpiresAt.getMinutes() + request.offerWindowMinutes,
    );

    await this.deliveryRequestRepository.update(requestId, { offerExpiresAt });

    return this.deliveryRequestRepository.updateStatus(
      requestId,
      DeliveryRequestStatus.PUBLISHED,
    );
  }
}
