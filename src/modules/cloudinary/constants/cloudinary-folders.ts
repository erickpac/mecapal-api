/**
 * Cloudinary folder structure for the application
 * Follows a hierarchical structure: app-name/module/entity-type/optional-subfolder
 */
export const CLOUDINARY_FOLDERS = {
  // User-related images
  USERS: {
    AVATARS: 'mecapal/users/avatars',
    DOCUMENTS: 'mecapal/users/documents',
    IDENTIFICATION: 'mecapal/users/identification',
  },

  // Vehicle-related images
  VEHICLES: {
    MAIN: 'mecapal/vehicles/main',
    DOCUMENTS: 'mecapal/vehicles/documents',
    DAMAGES: 'mecapal/vehicles/damages',
    INSPECTIONS: 'mecapal/vehicles/inspections',
  },

  // Service-related images
  SERVICES: {
    BEFORE: 'mecapal/services/before',
    AFTER: 'mecapal/services/after',
    REPORTS: 'mecapal/services/reports',
  },

  // Temporary uploads (should be cleaned up periodically)
  TEMP: 'mecapal/temp',
};

/**
 * Type for Cloudinary folder paths
 * This ensures type safety when using folder paths
 */
export type CloudinaryFolderPath =
  (typeof CLOUDINARY_FOLDERS)[keyof typeof CLOUDINARY_FOLDERS];

/**
 * Helper function to get a nested folder path
 * @param paths Array of folder path segments
 * @returns Complete folder path
 */
export function getCloudinaryFolderPath(...paths: string[]): string {
  return paths.join('/');
}

/**
 * Helper function to get a temporary folder path with a unique identifier
 * @param prefix Optional prefix for the temp folder
 * @returns Temporary folder path
 */
export function getTempFolderPath(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const tempPath = `${CLOUDINARY_FOLDERS.TEMP}/${timestamp}-${random}`;
  return prefix ? `${tempPath}/${prefix}` : tempPath;
}
