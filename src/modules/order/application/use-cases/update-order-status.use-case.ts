import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';
import { OrderStatus } from '../../domain/enums';
import {
  OrderNotFoundException,
  InvalidStatusTransitionException,
} from '../../domain/exceptions';
import { UpdateOrderStatusDto } from '../dtos';

// Valid status transitions for transporter
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    transporterId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Verify transporter owns this order
    if (order.transporterId !== transporterId) {
      throw new ForbiddenException('You are not the transporter for this order');
    }

    // Validate status transition
    const validNextStatuses = VALID_TRANSITIONS[order.status];
    if (!validNextStatuses.includes(dto.status)) {
      throw new InvalidStatusTransitionException(order.status, dto.status);
    }

    // Update the status
    return this.orderRepository.updateStatus(orderId, {
      status: dto.status,
      notes: dto.notes,
      changedBy: transporterId,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }
}
