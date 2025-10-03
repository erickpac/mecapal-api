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
   * Can handle both single-image entities (like user avatar) and multi-image entities (like vehicle photos)
   */
  async uploadEntityImage<T extends EntityWithImage, R>(params: {
    entityId: string;
    repository: EntityRepository<T>;
    imageBuffer: Buffer;
    cloudinaryFolder: string;
    imageField?: keyof T; // Optional for multi-image entities
    imageOptions?: ImageUploadOptions;
    createNewEntity?: boolean; // Flag to indicate if we should create a new entity instead of updating
    additionalData?: Partial<T>; // Additional data for new entity creation
    responseTransformer: (entity: T) => R;
  }): Promise<R> {
    // Validate and optimize image before upload
    await this.cloudinaryService.validateImage(params.imageBuffer);
    const optimizedBuffer = await this.cloudinaryService.optimizeImage(
      params.imageBuffer,
    );

    // Upload new image with transformations if provided
    const uploadResult = await this.cloudinaryService.uploadImage(
      optimizedBuffer,
      params.cloudinaryFolder,
      params.imageOptions,
    );

    let updatedEntity: T;

    if (params.createNewEntity) {
      // For multi-image entities (like vehicle photos)
      const createData = {
        [params.imageField as string]: uploadResult.secure_url,
        ...params.additionalData,
      } as Partial<T>;

      updatedEntity = await params.repository.create(
        params.entityId,
        createData,
      );
    } else {
      // For single-image entities (like user avatar)
      // Find the entity
      const entity = await params.repository.findById(params.entityId);

      if (!entity) {
        throw new Error(`Entity with ID ${params.entityId} not found`);
      }

      // Extract old image public ID if exists
      const currentImageUrl = entity[params.imageField as keyof T] as string;
      const oldImagePublicId = currentImageUrl
        ? this.cloudinaryService.extractPublicId(currentImageUrl)
        : null;

      // Update entity with new image URL
      const updateData = {
        [params.imageField as string]: uploadResult.secure_url,
      } as Partial<T>;

      updatedEntity = await params.repository.update(
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
    }

    // Transform and return entity
    return params.responseTransformer(updatedEntity);
  }
}
