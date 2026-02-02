import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { PAYMENT_TOKENS } from './domain/constants';
import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { StripeService } from './infrastructure/services/stripe.service';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import {
  AddPaymentMethodUseCase,
  GetPaymentMethodsUseCase,
  DeletePaymentMethodUseCase,
  SetDefaultPaymentMethodUseCase,
  CreatePaymentIntentUseCase,
  ConfirmPaymentUseCase,
  GetTransactionUseCase,
  GetTransactionsUseCase,
} from './application/use-cases';

@Module({
  imports: [ConfigModule, PrismaModule, DeliveryModule],
  controllers: [PaymentController],
  providers: [
    // Repository
    {
      provide: PAYMENT_TOKENS.IPaymentRepository,
      useClass: PaymentRepository,
    },
    // Stripe Service
    {
      provide: PAYMENT_TOKENS.IStripeService,
      useClass: StripeService,
    },
    // Use Cases
    AddPaymentMethodUseCase,
    GetPaymentMethodsUseCase,
    DeletePaymentMethodUseCase,
    SetDefaultPaymentMethodUseCase,
    CreatePaymentIntentUseCase,
    ConfirmPaymentUseCase,
    GetTransactionUseCase,
    GetTransactionsUseCase,
  ],
  exports: [PAYMENT_TOKENS.IPaymentRepository, PAYMENT_TOKENS.IStripeService],
})
export class PaymentModule {}
