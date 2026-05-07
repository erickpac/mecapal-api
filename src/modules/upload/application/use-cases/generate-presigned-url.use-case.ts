import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UPLOAD_TOKENS } from '../../domain/constants/injection-tokens';
import { UPLOAD_CONFIGS } from '../../domain/constants/upload-config';
import { IS3Service } from '../../domain/interfaces/s3.service.interface';
import { PresignedUrlRequestDto } from '../dtos/presigned-url-request.dto';
import { PresignedUrlResponseDto } from '../dtos/presigned-url-response.dto';

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

@Injectable()
export class GeneratePresignedUrlUseCase {
  constructor(
    @Inject(UPLOAD_TOKENS.IS3Service)
    private readonly s3Service: IS3Service,
  ) {}

  async execute(
    userId: string,
    dto: PresignedUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    const config = UPLOAD_CONFIGS[dto.category];

    if (!config.allowedMimeTypes.includes(dto.contentType)) {
      throw new BadRequestException(
        `Invalid content type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      );
    }

    const extension = MIME_TO_EXTENSION[dto.contentType];
    if (!extension) {
      // Unreachable as long as MIME_TO_EXTENSION covers every entry in
      // UPLOAD_CONFIGS.allowedMimeTypes — guard kept so we fail loudly
      // if someone adds a new MIME without an extension mapping.
      throw new BadRequestException(
        `No extension mapping for content type ${dto.contentType}`,
      );
    }

    const key = `${dto.category}/${userId}/${this.generateUniqueFilename(extension)}`;

    const { url, fields, fileUrl } = await this.s3Service.generatePresignedPost(
      {
        key,
        contentType: dto.contentType,
        expiresIn: config.expiresInSeconds,
        maxSize: config.maxSizeBytes,
        tags: {
          userId,
          category: dto.category,
          uploadedAt: new Date().toISOString(),
        },
      },
    );

    return {
      url,
      fields,
      fileUrl,
      expiresIn: config.expiresInSeconds,
    };
  }

  private generateUniqueFilename(extension: string): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    return `${timestamp}-${random}.${extension}`;
  }
}
