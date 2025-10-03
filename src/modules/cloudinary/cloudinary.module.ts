import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';
import { CloudinaryImageService } from './infrastructure/services/cloudinary-image.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService, CloudinaryImageService],
  exports: [CloudinaryService, CloudinaryImageService],
})
export class CloudinaryModule {}
