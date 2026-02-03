import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';
import { OrderNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Check authorization
    if (
      !isAdmin &&
      order.clientId !== userId &&
      order.transporterId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async executeByOrderNumber(
    orderNumber: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<Order> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);

    if (!order) {
      throw new OrderNotFoundException(orderNumber);
    }

    // Check authorization
    if (
      !isAdmin &&
      order.clientId !== userId &&
      order.transporterId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }
}
