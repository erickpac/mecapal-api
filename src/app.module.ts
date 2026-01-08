import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoModule } from './modules/cognito/cognito.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AddressModule } from './modules/address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CognitoModule,
    UserModule,
    AddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
