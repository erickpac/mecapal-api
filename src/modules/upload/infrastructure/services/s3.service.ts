import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IS3Service,
  PresignedUrlParams,
  PresignedUrlResult,
} from './s3.service.interface';

@Injectable()
export class S3Service implements IS3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');

    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  async generatePresignedUrl(
    params: PresignedUrlParams,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.maxSize,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresIn,
    });

    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${params.key}`;

    return {
      uploadUrl,
      fileUrl,
    };
  }
}
