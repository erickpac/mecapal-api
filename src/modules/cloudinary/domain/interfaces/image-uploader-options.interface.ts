/**
 * Options for image upload and transformation in Cloudinary
 * These options are applied after the initial file validation
 */
export interface ImageUploadOptions {
  /**
   * Target width for the image. If not specified, aspect ratio will be maintained
   */
  width?: number;

  /**
   * Target height for the image. If not specified, aspect ratio will be maintained
   */
  height?: number;

  /**
   * How to handle image cropping:
   * - fill: Crop to fill the specified dimensions
   * - fit: Resize to fit within the specified dimensions
   * - scale: Scale the image to the specified dimensions
   * - thumb: Create a thumbnail with face detection
   */
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';

  /**
   * Image quality:
   * - 'auto': Let Cloudinary optimize quality
   * - number: Specific quality value (1-100)
   */
  quality?: 'auto' | number;

  /**
   * Output format for the image
   */
  format?: 'jpg' | 'png' | 'webp';

  /**
   * Whether to strip EXIF data for privacy
   * @default true
   */
  stripMetadata?: boolean;

  /**
   * Whether to automatically correct image orientation
   * @default true
   */
  autoOrient?: boolean;
}
