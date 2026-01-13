import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';

const VIEWABLE_STATUSES = [
  DeliveryRequestStatus.PUBLISHED,
  DeliveryRequestStatus.OFFERS_RECEIVED,
];

@Injectable()
export class GetRequestDetailsUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(requestId: string): Promise<DeliveryRequest> {
    const request =
      await this.deliveryRequestRepository.findByIdWithDetails(requestId);

    if (!request || !VIEWABLE_STATUSES.includes(request.status)) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    return request;
  }
}
