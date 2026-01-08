import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UPLOAD_TOKENS } from '../../domain/constants/injection-tokens';
import { UPLOAD_CONFIGS } from '../../domain/constants/upload-config';
import { IS3Service } from '../../infrastructure/services/s3.service.interface';
import { PresignedUrlRequestDto } from '../dtos/presigned-url-request.dto';
import { PresignedUrlResponseDto } from '../dtos/presigned-url-response.dto';

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

    const fileExtension = this.getFileExtension(dto.filename);
    const uniqueFilename = this.generateUniqueFilename(userId, fileExtension);
    const key = `${dto.category}/${userId}/${uniqueFilename}`;

    const { uploadUrl, fileUrl } = await this.s3Service.generatePresignedUrl({
      key,
      contentType: dto.contentType,
      expiresIn: config.expiresInSeconds,
      maxSize: config.maxSizeBytes,
    });

    return {
      uploadUrl,
      fileUrl,
      expiresIn: config.expiresInSeconds,
    };
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  private generateUniqueFilename(userId: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return extension
      ? `${timestamp}-${random}.${extension}`
      : `${timestamp}-${random}`;
  }
}
