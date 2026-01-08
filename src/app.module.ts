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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
