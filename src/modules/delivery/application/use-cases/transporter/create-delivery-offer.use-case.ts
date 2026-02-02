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
import { GetClientBillingProfileUseCase } from '../../../../commission/application/use-cases';

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
    private readonly getClientBillingProfileUseCase: GetClientBillingProfileUseCase,
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

    // Get client's billing profile (commission + tax configuration)
    const billing = await this.getClientBillingProfileUseCase.execute(
      request.clientId,
    );

    // Calculate commission
    const commissionAmount = billing.calculateCommission(dto.offeredPrice);

    // Calculate subtotal (transporter price + commission)
    const subtotal = dto.offeredPrice + commissionAmount;

    // Calculate tax on subtotal
    const taxAmount = billing.calculateTax(subtotal);

    // Calculate total client price
    const totalClientPrice = subtotal + taxAmount;

    // Net earnings = offered price (transporter keeps their price, platform takes commission from client)
    const netEarnings = dto.offeredPrice;

    const offer = await this.deliveryOfferRepository.create(transporterId, {
      deliveryRequestId: requestId,
      vehicleId: dto.vehicleId,
      offeredPrice: dto.offeredPrice,
      estimatedTimeMinutes: dto.estimatedTimeMinutes,
      estimatedPickupTime: new Date(dto.estimatedPickupTime),
      estimatedDeliveryTime: new Date(dto.estimatedDeliveryTime),
      notes: dto.notes,

      // Commission details
      commissionType: billing.commissionType,
      commissionPercent:
        billing.commissionType === 'PERCENTAGE'
          ? billing.commissionValue
          : null,
      commissionFixedAmount:
        billing.commissionType === 'FIXED_AMOUNT'
          ? billing.commissionValue
          : null,
      commissionMinimum: billing.commissionMinimum,
      commissionMaximum: billing.commissionMaximum,
      commissionAmount,
      commissionExempt: billing.isCommissionExempt,

      // Tax details
      taxPercent: billing.taxPercent,
      taxAmount,
      taxExempt: billing.isTaxExempt,

      // Totals
      subtotal,
      totalClientPrice,
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
