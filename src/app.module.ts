import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, CloudinaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
