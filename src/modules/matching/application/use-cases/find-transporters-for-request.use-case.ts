import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MATCHING_TOKENS } from '../../domain/constants';
import { IMatchingService } from '../../domain/interfaces';
import { MatchedTransporter } from '../../domain/entities';
import { DELIVERY_TOKENS } from '../../../delivery/domain/constants';
import { IDeliveryRequestRepository } from '../../../delivery/domain/repositories';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';

@Injectable()
export class FindTransportersForRequestUseCase {
  constructor(
    @Inject(MATCHING_TOKENS.IMatchingService)
    private readonly matchingService: IMatchingService,
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(
    deliveryRequestId: string,
    options?: { minRating?: number; limit?: number },
  ): Promise<MatchedTransporter[]> {
    // Get the delivery request with addresses
    const request =
      await this.deliveryRequestRepository.findByIdWithDetails(deliveryRequestId);

    if (!request) {
      throw new NotFoundException(
        `Delivery request with ID ${deliveryRequestId} not found`,
      );
    }

    if (!request.pickupAddress || !request.deliveryAddress) {
      throw new NotFoundException(
        'Delivery request is missing pickup or delivery address',
      );
    }

    // Use city as municipality name for matching
    const pickupMunicipality = request.pickupAddress.city;
    const deliveryMunicipality = request.deliveryAddress.city;

    return this.matchingService.findEligibleTransporters({
      pickupMunicipality,
      deliveryMunicipality,
      loadType: request.loadType as LoadType,
      minRating: options?.minRating,
      limit: options?.limit,
    });
  }
}
