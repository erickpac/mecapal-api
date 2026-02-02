import { Injectable, Inject } from '@nestjs/common';
import { ORDER_TOKENS } from '../../domain/constants';
import { IOrderRepository, OrderFilters } from '../../domain/interfaces';
import { Order } from '../../domain/entities';

@Injectable()
export class GetClientOrdersUseCase {
  constructor(
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(clientId: string, filters?: OrderFilters): Promise<Order[]> {
    return this.orderRepository.findByClientId(clientId, filters);
  }
}
