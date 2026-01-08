import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoModule } from './modules/cognito/cognito.module';
import { PrismaModule } from './modules/prisma/prisma.module';
// TODO: Replace with S3 - Cloudinary module removed
// import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CognitoModule,
    // TODO: Replace with S3 - Add S3Module when implemented
    // CloudinaryModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
