import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order, OrderStatusHistory, OrderLocation } from '../../domain/entities';
import { OrderNotFoundException } from '../../domain/exceptions';

export interface OrderTrackingResult {
  order: Order;
  statusHistory: OrderStatusHistory[];
  latestLocation: OrderLocation | null;
  recentLocations: OrderLocation[];
}

@Injectable()
export class GetOrderTrackingUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<OrderTrackingResult> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Check authorization
    if (!isAdmin && order.clientId !== userId && order.transporterId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const [statusHistory, latestLocation, recentLocations] = await Promise.all([
      this.orderRepository.getStatusHistory(orderId),
      this.orderRepository.getLatestLocation(orderId),
      this.orderRepository.getLocationUpdates(orderId, 10),
    ]);

    return {
      order,
      statusHistory,
      latestLocation,
      recentLocations,
    };
  }
}
