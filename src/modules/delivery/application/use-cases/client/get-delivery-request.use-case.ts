import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';

@Injectable()
export class GetDeliveryRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(requestId: string, clientId: string): Promise<DeliveryRequest> {
    const request =
      await this.deliveryRequestRepository.findByIdWithDetails(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    return request;
  }
}
