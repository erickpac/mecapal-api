import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { MATCHING_TOKENS } from '../../domain/constants';
import { IMatchingService } from '../../domain/interfaces';
import { MatchedTransporter } from '../../domain/entities';
import { DELIVERY_TOKENS } from '../../../delivery/domain/constants';
import { IDeliveryRequestRepository } from '../../../delivery/domain/repositories';

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
      await this.deliveryRequestRepository.findByIdWithDetails(
        deliveryRequestId,
      );

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

    if (
      !request.pickupAddress.municipality ||
      !request.deliveryAddress.municipality
    ) {
      throw new NotFoundException(
        'Delivery request addresses are missing municipality data',
      );
    }

    const pickupMunicipality = request.pickupAddress.municipality.name;
    const deliveryMunicipality = request.deliveryAddress.municipality.name;

    return this.matchingService.findEligibleTransporters({
      pickupMunicipality,
      deliveryMunicipality,
      loadType: request.loadType,
      minRating: options?.minRating,
      limit: options?.limit,
    });
  }
}
