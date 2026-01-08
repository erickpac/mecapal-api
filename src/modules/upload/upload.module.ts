import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoModule } from '../cognito/cognito.module';
import { UploadController } from './infrastructure/controllers/upload.controller';
import { S3Service } from './infrastructure/services/s3.service';
import { UPLOAD_TOKENS } from './domain/constants/injection-tokens';
import { GeneratePresignedUrlUseCase } from './application/use-cases/generate-presigned-url.use-case';

@Module({
  imports: [ConfigModule, CognitoModule],
  controllers: [UploadController],
  providers: [
    // Services
    {
      provide: UPLOAD_TOKENS.IS3Service,
      useClass: S3Service,
    },
    // Use Cases
    GeneratePresignedUrlUseCase,
  ],
  exports: [UPLOAD_TOKENS.IS3Service],
})
export class UploadModule {}
