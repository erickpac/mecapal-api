import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';
import { OrderStatus } from '../../domain/enums';
import {
  OrderNotFoundException,
  InvalidOrderStatusException,
} from '../../domain/exceptions';
import { CancelOrderDto } from '../dtos';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    dto: CancelOrderDto,
    isAdmin: boolean = false,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Check authorization - only client, transporter, or admin can cancel
    if (
      !isAdmin &&
      order.clientId !== userId &&
      order.transporterId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to cancel this order',
      );
    }

    // Verify order can be cancelled
    const cancellableStatuses = [
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PROGRESS,
    ];
    if (!cancellableStatuses.includes(order.status)) {
      throw new InvalidOrderStatusException(order.status, cancellableStatuses);
    }

    return this.orderRepository.cancelOrder(orderId, {
      cancellationReason: dto.cancellationReason,
      cancelledBy: userId,
    });
  }
}
