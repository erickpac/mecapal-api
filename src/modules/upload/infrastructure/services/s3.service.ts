import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IS3Service,
  PresignedUrlParams,
  PresignedUrlResult,
} from './s3.service.interface';

@Injectable()
export class S3Service implements IS3Service {
  private readonly logger = new Logger(S3Service.name);
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
    // Note: do NOT include ContentLength here — it gets signed into the
    // presigned URL as an exact value, causing S3 to reject uploads whose
    // actual Content-Length differs (which is always the case in practice).
    // Max-size enforcement should happen via presigned POST with a
    // content-length-range condition or via bucket policy.
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      ContentType: params.contentType,
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

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    // S3 allows up to 1000 keys per DeleteObjects call. For the account
    // deletion use case we're well under that, but chunk for safety.
    const chunkSize = 1000;
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      });
      const response = await this.s3Client.send(command);
      if (response.Errors && response.Errors.length > 0) {
        this.logger.warn(
          `S3 delete returned ${response.Errors.length} error(s): ${response.Errors.map(
            (e) => `${e.Key}:${e.Code}`,
          ).join(', ')}`,
        );
      }
    }
  }

  extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const expectedHost = `${this.bucketName}.s3.${this.region}.amazonaws.com`;
      if (parsed.host !== expectedHost) return null;
      const key = parsed.pathname.replace(/^\/+/, '');
      return key || null;
    } catch {
      return null;
    }
  }
}
