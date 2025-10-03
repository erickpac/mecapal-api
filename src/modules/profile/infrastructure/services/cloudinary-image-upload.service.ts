import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../../cloudinary/infrastructure/services/cloudinary.service';
import { IImageUploadService } from '../../domain/services/image-upload.service.interface';

@Injectable()
export class CloudinaryImageUploadService implements IImageUploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(imageBuffer: Buffer, folder: string): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(
        imageBuffer,
        folder,
      );
      return result.secure_url;
    } catch (error) {
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract public ID from URL
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      await this.cloudinaryService.deleteImage(publicId);
    } catch (error) {
      throw new Error(
        `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private extractPublicIdFromUrl(url: string): string {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Get the part after 'upload' and before the file extension
    const publicIdWithVersion = parts.slice(uploadIndex + 2).join('/');
    return publicIdWithVersion.replace(/\.[^/.]+$/, ''); // Remove file extension
  }
}
