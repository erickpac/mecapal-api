import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { CreateDeliveryRequestDto } from '../../dtos/create-delivery-request.dto';

@Injectable()
export class CreateDeliveryRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(
    clientId: string,
    dto: CreateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    const pickupDate = new Date(dto.pickupDate);
    const deliveryDeadline = new Date(dto.deliveryDeadline);

    // Parse time strings (HH:mm format)
    const [startHours, startMinutes] = dto.pickupTimeStart
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = dto.pickupTimeEnd.split(':').map(Number);

    const pickupTimeStart = new Date(pickupDate);
    pickupTimeStart.setHours(startHours, startMinutes, 0, 0);

    const pickupTimeEnd = new Date(pickupDate);
    pickupTimeEnd.setHours(endHours, endMinutes, 0, 0);

    // Calculate offer expiration based on window
    const offerExpiresAt = new Date();
    offerExpiresAt.setMinutes(
      offerExpiresAt.getMinutes() + dto.offerWindowMinutes,
    );

    return this.deliveryRequestRepository.create(clientId, {
      loadType: dto.loadType,
      pickupAddressId: dto.pickupAddressId,
      deliveryAddressId: dto.deliveryAddressId,
      calculatedDistanceKm: dto.calculatedDistanceKm,
      estimatedWeightKg: dto.estimatedWeightKg,
      estimatedVolumeM3: dto.estimatedVolumeM3,
      packageDescription: dto.packageDescription,
      declaredValue: dto.declaredValue,
      isFragile: dto.isFragile,
      requiresSignature: dto.requiresSignature,
      specialInstructions: dto.specialInstructions,
      pickupDate,
      pickupTimeStart,
      pickupTimeEnd,
      deliveryDeadline,
      offerWindowMinutes: dto.offerWindowMinutes,
      offerExpiresAt,
    });
  }
}
