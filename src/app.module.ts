import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ResendModule } from './modules/resend/resend.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    ProfileModule,
    ResendModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
