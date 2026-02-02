import { Injectable, Inject } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository, OrderFilters } from '../../domain/interfaces';
import { Order } from '../../domain/entities';

@Injectable()
export class GetTransporterOrdersUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    transporterId: string,
    filters?: OrderFilters,
  ): Promise<Order[]> {
    return this.orderRepository.findByTransporterId(transporterId, filters);
  }

  async getActiveOrder(transporterId: string): Promise<Order | null> {
    return this.orderRepository.findActiveByTransporterId(transporterId);
  }
}
