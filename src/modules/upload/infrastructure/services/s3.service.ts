import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {
  IS3Service,
  PresignedPostParams,
  PresignedPostResult,
} from '../../domain/interfaces/s3.service.interface';

@Injectable()
export class S3Service implements IS3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly cloudFrontDomain: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.cloudFrontDomain = this.configService.getOrThrow<string>(
      'AWS_CLOUDFRONT_DOMAIN',
    );

    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  async generatePresignedPost(
    params: PresignedPostParams,
  ): Promise<PresignedPostResult> {
    const tagging = this.buildTaggingXml(params.tags);

    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucketName,
      Key: params.key,
      Expires: params.expiresIn,
      Conditions: [
        ['content-length-range', 1, params.maxSize],
        ['eq', '$Content-Type', params.contentType],
        ['eq', '$x-amz-server-side-encryption', 'AES256'],
        ['eq', '$tagging', tagging],
      ],
      Fields: {
        'Content-Type': params.contentType,
        'x-amz-server-side-encryption': 'AES256',
        tagging,
      },
    });

    // Public URL goes through CloudFront (with OAC), keeping the bucket
    // private. The S3 endpoint URL would 403 for end users.
    const fileUrl = `https://${this.cloudFrontDomain}/${params.key}`;

    return {
      url,
      fields,
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
      // Accept both the CloudFront distribution host (current/preferred)
      // and the direct S3 host (kept for backward compatibility with any
      // URLs persisted before the CDN migration).
      const cloudFrontHost = this.cloudFrontDomain;
      const s3Host = `${this.bucketName}.s3.${this.region}.amazonaws.com`;
      if (parsed.host !== cloudFrontHost && parsed.host !== s3Host) {
        return null;
      }
      const key = parsed.pathname.replace(/^\/+/, '');
      return key || null;
    } catch {
      return null;
    }
  }

  /**
   * Builds the XML payload S3 expects in the `tagging` form field for a
   * presigned POST. Keys/values are URL-encoded to keep the XML safe;
   * tag inputs are server-controlled so the surface is small, but we
   * still escape defensively.
   */
  private buildTaggingXml(tags: Record<string, string>): string {
    const entries = Object.entries(tags)
      .map(
        ([k, v]) =>
          `<Tag><Key>${this.escapeXml(k)}</Key><Value>${this.escapeXml(v)}</Value></Tag>`,
      )
      .join('');
    return `<Tagging><TagSet>${entries}</TagSet></Tagging>`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
