import { FileCategory } from '../enums/file-category.enum';

export interface UploadConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  expiresInSeconds: number;
}

export const UPLOAD_CONFIGS: Record<FileCategory, UploadConfig> = {
  [FileCategory.VEHICLE_PHOTO]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    expiresInSeconds: 120, // 2 minutes
  },
  [FileCategory.VEHICLE_DOCUMENT]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
    expiresInSeconds: 180, // 3 minutes — larger payloads
  },
  [FileCategory.PROFILE_DOCUMENT]: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
    expiresInSeconds: 180,
  },
  [FileCategory.PROFILE_PHOTO]: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    expiresInSeconds: 120,
  },
};
