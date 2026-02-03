import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoModule } from './modules/cognito/cognito.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AddressModule } from './modules/address/address.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { UploadModule } from './modules/upload/upload.module';
import { BackofficeModule } from './modules/backoffice/backoffice.module';
import { LocationModule } from './modules/location/location.module';
import { ZonePreferenceModule } from './modules/zone-preference/zone-preference.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { CommissionModule } from './modules/commission/infrastructure/commission.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrderModule } from './modules/order/order.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { ReviewModule } from './modules/review/review.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CognitoModule,
    UserModule,
    AddressModule,
    VehicleModule,
    UploadModule,
    BackofficeModule,
    LocationModule,
    ZonePreferenceModule,
    DeliveryModule,
    CommissionModule,
    PaymentModule,
    OrderModule,
    BankAccountModule,
    SettlementModule,
    ReviewModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
