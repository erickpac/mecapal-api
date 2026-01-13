import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import {
  IDeliveryRequestRepository,
  FindDeliveryRequestsOptions,
} from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';

@Injectable()
export class GetMyDeliveryRequestsUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(
    clientId: string,
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]> {
    return this.deliveryRequestRepository.findByClientId(clientId, options);
  }
}
