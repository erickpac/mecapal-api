import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
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
import { CommissionModule } from './modules/commission/commission.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrderModule } from './modules/order/order.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { ReviewModule } from './modules/review/review.module';
import { MatchingModule } from './modules/matching/matching.module';
import { IncidentModule } from './modules/incident/incident.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AccountModule } from './modules/account/account.module';
import { HealthController } from './health.controller';

// Feature flags evaluated at bootstrap. Opt-in by design: a new environment
// that forgets to set the flag stays off rather than silently exposing an
// unfinished feature.
const accountDeletionEnabled = process.env.ACCOUNT_DELETION_ENABLED === 'true';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Rate limiter is registered globally so any module can opt in via
    // `@UseGuards(ThrottlerGuard) + @Throttle(...)`. We deliberately do
    // NOT register the guard as `APP_GUARD` to keep throttling opt-in.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
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
    MatchingModule,
    IncidentModule,
    ReportsModule,
    NotificationModule,
    ...(accountDeletionEnabled ? [AccountModule] : []),
  ],
  controllers: [HealthController],
  providers: [
    // Catch-all filter enforcing the standardized error contract
    // ({ statusCode, error: <ERROR_CODE>, message, ...details }) for every
    // error response. Module-scoped filters (cognito, account) still take
    // precedence for the specific exceptions they `@Catch`; this is the
    // safety net so nothing falls through to a raw 500 without a code.
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
