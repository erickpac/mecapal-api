import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { OrderLocation } from '../../domain/entities';
import {
  OrderNotFoundException,
  InvalidOrderStatusException,
} from '../../domain/exceptions';
import { OrderStatus } from '../../domain/enums';
import { AddLocationDto } from '../dtos';

@Injectable()
export class AddLocationUpdateUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    transporterId: string,
    dto: AddLocationDto,
  ): Promise<OrderLocation> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Verify transporter owns this order
    if (order.transporterId !== transporterId) {
      throw new ForbiddenException(
        'You are not the transporter for this order',
      );
    }

    // Only allow location updates for active orders
    const activeStatuses = [
      OrderStatus.IN_PROGRESS,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
    ];

    if (!activeStatuses.includes(order.status)) {
      throw new InvalidOrderStatusException(order.status, activeStatuses);
    }

    return this.orderRepository.addLocationUpdate(orderId, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      heading: dto.heading,
      accuracy: dto.accuracy,
    });
  }
}
