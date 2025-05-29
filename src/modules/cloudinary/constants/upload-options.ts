import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UploadedFileType } from '../domain/interfaces/file-upload.interface';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

/**
 * Common configuration options for image uploads across the application
 * This can be used by any module that needs to handle image uploads
 */
export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size - matches CloudinaryService
  },
  fileFilter: (
    _req: any,
    file: UploadedFileType,
    callback: FileFilterCallback,
  ) => {
    // Match all supported image formats including HEIC/HEIF
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic|heif|webp)$/i)) {
      return callback(
        new BadRequestException(
          'Only image files (jpg, jpeg, png, gif, heic, heif, webp) are allowed',
        ),
        false,
      );
    }

    // Check mimetype as well for additional security
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    }

    callback(null, true);
  },
};
