import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';
import { InvalidRequestStatusException } from '../../../domain/exceptions/invalid-request-status.exception';

const CANCELLABLE_STATUSES = [
  DeliveryRequestStatus.DRAFT,
  DeliveryRequestStatus.PUBLISHED,
  DeliveryRequestStatus.OFFERS_RECEIVED,
];

@Injectable()
export class CancelDeliveryRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(requestId: string, clientId: string): Promise<DeliveryRequest> {
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    if (!CANCELLABLE_STATUSES.includes(request.status)) {
      throw new InvalidRequestStatusException(
        request.status,
        CANCELLABLE_STATUSES,
      );
    }

    return this.deliveryRequestRepository.updateStatus(
      requestId,
      DeliveryRequestStatus.CANCELLED,
    );
  }
}
