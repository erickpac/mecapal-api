import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';
import { OrderStatus } from '../../domain/enums';
import {
  OrderNotFoundException,
  InvalidOrderStatusException,
} from '../../domain/exceptions';
import { ConfirmDeliveryDto } from '../dtos';

@Injectable()
export class ConfirmDeliveryUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    orderId: string,
    transporterId: string,
    dto: ConfirmDeliveryDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // Verify transporter owns this order
    if (order.transporterId !== transporterId) {
      throw new ForbiddenException('You are not the transporter for this order');
    }

    // Verify order is in IN_TRANSIT status
    if (order.status !== OrderStatus.IN_TRANSIT) {
      throw new InvalidOrderStatusException(order.status, [OrderStatus.IN_TRANSIT]);
    }

    // Confirm delivery and update status to DELIVERED
    const confirmedOrder = await this.orderRepository.confirmDelivery(orderId, {
      deliveryPhotoUrl: dto.deliveryPhotoUrl,
      deliverySignature: dto.deliverySignature,
      deliveryNotes: dto.deliveryNotes,
      receiverName: dto.receiverName,
      deliveredToAddress: dto.deliveredToAddress,
    });

    // Update status to DELIVERED
    return this.orderRepository.updateStatus(orderId, {
      status: OrderStatus.DELIVERED,
      changedBy: transporterId,
      notes: 'Delivery confirmed by transporter',
    });
  }
}
