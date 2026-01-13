import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import {
  IDeliveryRequestRepository,
  FindDeliveryRequestsOptions,
} from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';

@Injectable()
export class GetAvailableRequestsUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]> {
    return this.deliveryRequestRepository.findAvailable(options);
  }
}
