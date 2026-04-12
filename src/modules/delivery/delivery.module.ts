import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { CommissionModule } from '../commission/commission.module';

// Controllers
import { ClientDeliveryController } from './infrastructure/controllers/client-delivery.controller';
import { TransporterDeliveryController } from './infrastructure/controllers/transporter-delivery.controller';

// Repositories
import { DeliveryRequestRepository } from './infrastructure/repositories/delivery-request.repository';
import { DeliveryOfferRepository } from './infrastructure/repositories/delivery-offer.repository';

// Tokens
import { DELIVERY_TOKENS } from './domain/constants/injection-tokens';

// Client Use Cases
import { CreateDeliveryRequestUseCase } from './application/use-cases/client/create-delivery-request.use-case';
import { GetMyDeliveryRequestsUseCase } from './application/use-cases/client/get-my-delivery-requests.use-case';
import { GetDeliveryRequestUseCase } from './application/use-cases/client/get-delivery-request.use-case';
import { UpdateDeliveryRequestUseCase } from './application/use-cases/client/update-delivery-request.use-case';
import { PublishDeliveryRequestUseCase } from './application/use-cases/client/publish-delivery-request.use-case';
import { CancelDeliveryRequestUseCase } from './application/use-cases/client/cancel-delivery-request.use-case';
import { GetOffersForRequestUseCase } from './application/use-cases/client/get-offers-for-request.use-case';
import { AcceptOfferUseCase } from './application/use-cases/client/accept-offer.use-case';

// Transporter Use Cases
import { GetAvailableRequestsUseCase } from './application/use-cases/transporter/get-available-requests.use-case';
import { GetRequestDetailsUseCase } from './application/use-cases/transporter/get-request-details.use-case';
import { CreateDeliveryOfferUseCase } from './application/use-cases/transporter/create-delivery-offer.use-case';
import { GetMyOffersUseCase } from './application/use-cases/transporter/get-my-offers.use-case';
import { CancelOfferUseCase } from './application/use-cases/transporter/cancel-offer.use-case';

// Schedulers
import { OfferExpirationScheduler } from './infrastructure/schedulers/offer-expiration.scheduler';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    CognitoModule,
    VehicleModule,
    CommissionModule,
  ],
  controllers: [ClientDeliveryController, TransporterDeliveryController],
  providers: [
    // Repositories
    {
      provide: DELIVERY_TOKENS.IDeliveryRequestRepository,
      useClass: DeliveryRequestRepository,
    },
    {
      provide: DELIVERY_TOKENS.IDeliveryOfferRepository,
      useClass: DeliveryOfferRepository,
    },

    // Client Use Cases
    CreateDeliveryRequestUseCase,
    GetMyDeliveryRequestsUseCase,
    GetDeliveryRequestUseCase,
    UpdateDeliveryRequestUseCase,
    PublishDeliveryRequestUseCase,
    CancelDeliveryRequestUseCase,
    GetOffersForRequestUseCase,
    AcceptOfferUseCase,

    // Transporter Use Cases
    GetAvailableRequestsUseCase,
    GetRequestDetailsUseCase,
    CreateDeliveryOfferUseCase,
    GetMyOffersUseCase,
    CancelOfferUseCase,

    // Schedulers
    OfferExpirationScheduler,
  ],
  exports: [
    DELIVERY_TOKENS.IDeliveryRequestRepository,
    DELIVERY_TOKENS.IDeliveryOfferRepository,
  ],
})
export class DeliveryModule {}
