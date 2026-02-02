import { Injectable, Inject } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository } from '../../domain/interfaces';
import { Order } from '../../domain/entities';

export interface CreateOrderInput {
  deliveryOfferId: string;
  transactionId: string;
  clientId: string;
  transporterId: string;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // Check if order already exists for this delivery offer
    const existingOrder = await this.orderRepository.findByDeliveryOfferId(
      input.deliveryOfferId,
    );

    if (existingOrder) {
      return existingOrder;
    }

    // Create the order
    const order = await this.orderRepository.create({
      deliveryOfferId: input.deliveryOfferId,
      transactionId: input.transactionId,
      clientId: input.clientId,
      transporterId: input.transporterId,
    });

    return order;
  }
}
