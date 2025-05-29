import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import { env } from '../../../../config/env.config';
import * as sharp from 'sharp';

interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'jpg' | 'png' | 'gif' | 'webp';
}

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  // Mobile-friendly image constraints
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB - mobile photos can be larger
  private readonly MAX_DIMENSION = 4096; // Max width or height - modern phones can take 4K photos
  private readonly MIN_DIMENSION = 100; // Minimum dimension to ensure quality
  private readonly ALLOWED_FORMATS = [
    'jpeg',
    'jpg',
    'png',
    'heic',
    'heif',
    'webp',
  ];

  onModuleInit() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /**
   * Upload an image to Cloudinary with retry mechanism
   * @param file The file to upload (Buffer)
   * @param folder Optional folder to store the image
   * @param transformations Optional image transformations
   * @returns Promise with upload results
   */
  async uploadImage(
    file: Buffer,
    folder?: string,
    transformations?: ImageTransformationOptions,
  ): Promise<UploadApiResponse> {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'auto',
      ...(folder && { folder }),
      ...(transformations && {
        transformation: [
          {
            ...(transformations.width && { width: transformations.width }),
            ...(transformations.height && { height: transformations.height }),
            ...(transformations.crop && { crop: transformations.crop }),
            ...(transformations.quality && {
              quality: transformations.quality,
            }),
            ...(transformations.format && { format: transformations.format }),
          },
        ],
      }),
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                reject(new Error(error.message || 'Error uploading file'));
              } else {
                resolve(result as UploadApiResponse);
              }
            },
          );
          uploadStream.end(file);
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Upload attempt ${attempt} failed: ${lastError.message}`,
        );
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    throw new Error(
      `Failed to upload image after ${this.MAX_RETRIES} attempts: ${
        lastError?.message || 'Unknown error'
      }`,
    );
  }

  /**
   * Delete an image from Cloudinary with retry mechanism
   * @param publicId Public ID of the image to delete
   * @returns Promise with deletion result
   */
  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return (await cloudinary.uploader.destroy(
          publicId,
        )) as UploadApiResponse;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Delete attempt ${attempt} failed: ${lastError.message}`,
        );
        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }

    throw new Error(
      `Failed to delete image after ${this.MAX_RETRIES} attempts: ${
        lastError?.message || 'Unknown error'
      }`,
    );
  }

  /**
   * Extracts the public ID from a Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      return match && match[1] ? match[1] : null;
    } catch (error: unknown) {
      this.logger.error(
        `Error extracting public ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Validates image for mobile app uploads
   * @param buffer Image buffer
   * @returns Promise<boolean>
   */
  async validateImage(buffer: Buffer): Promise<boolean> {
    // Check file size
    if (buffer.length > this.MAX_IMAGE_SIZE) {
      throw new Error(
        `Image size exceeds maximum allowed size of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      );
    }

    try {
      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Validate dimensions
      if (!metadata.width || !metadata.height) {
        throw new Error('Could not determine image dimensions');
      }

      // Check if either dimension is too small
      if (
        metadata.width < this.MIN_DIMENSION ||
        metadata.height < this.MIN_DIMENSION
      ) {
        throw new Error(
          `Image dimensions too small. Minimum dimension is ${this.MIN_DIMENSION}px`,
        );
      }

      // Check if either dimension is too large
      if (
        metadata.width > this.MAX_DIMENSION ||
        metadata.height > this.MAX_DIMENSION
      ) {
        throw new Error(
          `Image dimensions too large. Maximum dimension is ${this.MAX_DIMENSION}px`,
        );
      }

      // Validate format
      if (!metadata.format || !this.ALLOWED_FORMATS.includes(metadata.format)) {
        throw new Error(
          `Invalid image format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`,
        );
      }

      // Log image details for debugging
      this.logger.debug(
        `Validated image: ${metadata.width}x${metadata.height}, format: ${metadata.format}, size: ${buffer.length / 1024}KB`,
      );

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Image validation failed: ${error.message}`);
      }
      throw new Error('Failed to validate image');
    }
  }

  /**
   * Optimizes an image for mobile upload
   * @param buffer Original image buffer
   * @returns Promise<Buffer> Optimized image buffer
   */
  async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      const metadata = await sharp(buffer).metadata();

      // If image is already small enough, return as is
      if (buffer.length <= this.MAX_IMAGE_SIZE / 2) {
        return buffer;
      }

      // Optimize image while maintaining aspect ratio
      return await sharp(buffer)
        .resize({
          width: Math.min(
            metadata.width || this.MAX_DIMENSION,
            this.MAX_DIMENSION,
          ),
          height: Math.min(
            metadata.height || this.MAX_DIMENSION,
            this.MAX_DIMENSION,
          ),
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, progressive: true })
        .toBuffer();
    } catch (error) {
      this.logger.error(
        `Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return buffer; // Return original buffer if optimization fails
    }
  }
}
