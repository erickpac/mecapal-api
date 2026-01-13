import { Injectable, Inject } from '@nestjs/common';
import { DELIVERY_TOKENS } from '../../../domain/constants/injection-tokens';
import {
  IDeliveryRequestRepository,
  UpdateDeliveryRequestData,
} from '../../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../../domain/entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../../../domain/enums/delivery-request-status.enum';
import { DeliveryRequestNotFoundException } from '../../../domain/exceptions/delivery-request-not-found.exception';
import { InvalidRequestStatusException } from '../../../domain/exceptions/invalid-request-status.exception';
import { UpdateDeliveryRequestDto } from '../../dtos/update-delivery-request.dto';

@Injectable()
export class UpdateDeliveryRequestUseCase {
  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
  ) {}

  async execute(
    requestId: string,
    clientId: string,
    dto: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    const request = await this.deliveryRequestRepository.findById(requestId);

    if (!request || request.clientId !== clientId) {
      throw new DeliveryRequestNotFoundException(requestId);
    }

    if (request.status !== DeliveryRequestStatus.DRAFT) {
      throw new InvalidRequestStatusException(
        request.status,
        DeliveryRequestStatus.DRAFT,
      );
    }

    const updateData: UpdateDeliveryRequestData = {};

    if (dto.calculatedDistanceKm !== undefined) {
      updateData.calculatedDistanceKm = dto.calculatedDistanceKm;
    }

    if (dto.estimatedWeightKg !== undefined) {
      updateData.estimatedWeightKg = dto.estimatedWeightKg;
    }

    if (dto.estimatedVolumeM3 !== undefined) {
      updateData.estimatedVolumeM3 = dto.estimatedVolumeM3;
    }

    if (dto.packageDescription !== undefined) {
      updateData.packageDescription = dto.packageDescription;
    }

    if (dto.declaredValue !== undefined) {
      updateData.declaredValue = dto.declaredValue;
    }

    if (dto.isFragile !== undefined) {
      updateData.isFragile = dto.isFragile;
    }

    if (dto.requiresSignature !== undefined) {
      updateData.requiresSignature = dto.requiresSignature;
    }

    if (dto.specialInstructions !== undefined) {
      updateData.specialInstructions = dto.specialInstructions;
    }

    if (dto.pickupDate !== undefined) {
      updateData.pickupDate = new Date(dto.pickupDate);
    }

    if (dto.pickupTimeStart !== undefined) {
      updateData.pickupTimeStart = new Date(
        `1970-01-01T${dto.pickupTimeStart}`,
      );
    }

    if (dto.pickupTimeEnd !== undefined) {
      updateData.pickupTimeEnd = new Date(`1970-01-01T${dto.pickupTimeEnd}`);
    }

    if (dto.deliveryDeadline !== undefined) {
      updateData.deliveryDeadline = new Date(dto.deliveryDeadline);
    }

    if (dto.offerWindowMinutes !== undefined) {
      updateData.offerWindowMinutes = dto.offerWindowMinutes;
    }

    return this.deliveryRequestRepository.update(requestId, updateData);
  }
}
