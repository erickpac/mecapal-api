import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ORDER_TOKENS } from './domain/constants';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import {
  ClientOrderController,
  TransporterOrderController,
} from './infrastructure/controllers';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  GetClientOrdersUseCase,
  GetTransporterOrdersUseCase,
  UpdateOrderStatusUseCase,
  AddLocationUpdateUseCase,
  ConfirmDeliveryUseCase,
  CancelOrderUseCase,
  GetOrderTrackingUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ClientOrderController, TransporterOrderController],
  providers: [
    // Repository
    {
      provide: ORDER_TOKENS.IOrderRepository,
      useClass: OrderRepository,
    },
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    GetClientOrdersUseCase,
    GetTransporterOrdersUseCase,
    UpdateOrderStatusUseCase,
    AddLocationUpdateUseCase,
    ConfirmDeliveryUseCase,
    CancelOrderUseCase,
    GetOrderTrackingUseCase,
  ],
  exports: [ORDER_TOKENS.IOrderRepository, CreateOrderUseCase],
})
export class OrderModule {}
