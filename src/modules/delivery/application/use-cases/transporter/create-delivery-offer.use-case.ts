import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { IDeliveryOfferRepository } from '../../../domain/repositories/delivery-offer.repository';
import { VEHICLE_TOKENS } from '../../../../vehicle/domain/constants/injection-tokens';
import { IVehicleRepository } from '../../../../vehicle/domain/repositories/vehicle.repository';
import { DeliveryOffer } from '../../../domain/entities/delivery-offer.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { VehicleStatus } from '../../../../vehicle/domain/enums/vehicle-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';
import { InvalidRequestStatusException } from '../../../domain/exceptions/invalid-request-status.exception';
import { OfferWindowExpiredException } from '../../../domain/exceptions/offer-window-expired.exception';
import { DuplicateOfferException } from '../../../domain/exceptions/duplicate-offer.exception';
import { CreateDeliveryOfferDto } from '../../dtos/create-delivery-offer.dto';

const PLATFORM_FEE_PERCENT = 15;

const OFFERABLE_STATUSES = [
  DeliveryRequestStatus.PUBLISHED,
  DeliveryRequestStatus.OFFERS_RECEIVED,
];

@Injectable()
export class CreateDeliveryOfferUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
    @Inject(VEHICLE_TOKENS.IVehicleRepository)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(
    requestId: string,
    transporterId: string,
    dto: CreateDeliveryOfferDto,
  ): Promise<DeliveryOffer> {
    // Validate request exists and is available
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    if (!OFFERABLE_STATUSES.includes(request.status)) {
      throw new InvalidRequestStatusException(
        request.status,
        OFFERABLE_STATUSES,
      );
    }

    // Check if offer window has expired
    if (new Date() > request.offerExpiresAt) {
      throw new OfferWindowExpiredException(requestId);
    }

    // Check for duplicate offer
    const existingOffer =
      await this.deliveryOfferRepository.existsByRequestAndTransporter(
        requestId,
        transporterId,
      );

    if (existingOffer) {
      throw new DuplicateOfferException(requestId);
    }

    // Validate vehicle belongs to transporter and is active
    const vehicle = await this.vehicleRepository.findById(dto.vehicleId);

    if (!vehicle || vehicle.userId !== transporterId) {
      throw new BadRequestException(
        'Vehicle not found or does not belong to you',
      );
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      throw new BadRequestException('Vehicle is not active');
    }

    // Calculate platform fee and net earnings
    const platformFee = (dto.offeredPrice * PLATFORM_FEE_PERCENT) / 100;
    const netEarnings = dto.offeredPrice - platformFee;

    const offer = await this.deliveryOfferRepository.create(transporterId, {
      deliveryRequestId: requestId,
      vehicleId: dto.vehicleId,
      offeredPrice: dto.offeredPrice,
      estimatedTimeMinutes: dto.estimatedTimeMinutes,
      estimatedPickupTime: new Date(dto.estimatedPickupTime),
      estimatedDeliveryTime: new Date(dto.estimatedDeliveryTime),
      notes: dto.notes,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      platformFee,
      netEarnings,
    });

    // Update request status to OFFERS_RECEIVED if it was PUBLISHED
    if (request.status === DeliveryRequestStatus.PUBLISHED) {
      await this.deliveryRequestRepository.updateStatus(
        requestId,
        DeliveryRequestStatus.OFFERS_RECEIVED,
      );
    }

    return offer;
  }
}
