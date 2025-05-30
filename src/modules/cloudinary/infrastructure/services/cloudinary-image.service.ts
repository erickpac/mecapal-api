import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { EntityWithImage } from '../../domain/interfaces/entity-with-image.interface';
import { EntityRepository } from '../../domain/repositories/entity.repository';
import { ImageUploadOptions } from '../../domain/interfaces/image-uploader-options.interface';

@Injectable()
export class CloudinaryImageService {
  private readonly logger = new Logger(CloudinaryImageService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Generic method to handle image uploads for any entity
   */
  async uploadEntityImage<T extends EntityWithImage, R>(params: {
    entityId: string;
    repository: EntityRepository<T>;
    imageBuffer: Buffer;
    cloudinaryFolder: string;
    imageField: keyof T;
    responseTransformer: (entity: T) => R;
    imageOptions?: ImageUploadOptions;
  }): Promise<R> {
    // Validate and optimize image before upload
    await this.cloudinaryService.validateImage(params.imageBuffer);
    const optimizedBuffer = await this.cloudinaryService.optimizeImage(
      params.imageBuffer,
    );

    // Find the entity
    const entity = await params.repository.findById(params.entityId);

    if (!entity) {
      throw new Error(`Entity with ID ${params.entityId} not found`);
    }

    // Extract old image public ID if exists
    const currentImageUrl = entity[params.imageField] as string;
    const oldImagePublicId = currentImageUrl
      ? this.cloudinaryService.extractPublicId(currentImageUrl)
      : null;

    // Upload new image with transformations if provided
    const uploadResult = await this.cloudinaryService.uploadImage(
      optimizedBuffer,
      params.cloudinaryFolder,
      params.imageOptions,
    );

    // Update entity with new image URL
    const updateData = {
      [params.imageField]: uploadResult.secure_url,
    } as Partial<T>;

    const updatedEntity = await params.repository.update(
      params.entityId,
      updateData,
    );

    // Try to delete old image if exists
    if (oldImagePublicId) {
      try {
        await this.cloudinaryService.deleteImage(oldImagePublicId);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error deleting old image: ${errorMessage}`);
      }
    }

    // Transform and return entity
    return params.responseTransformer(updatedEntity);
  }
}
