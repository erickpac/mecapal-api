/**
 * Image transformation options for Cloudinary
 * Used for configuring image transformations during upload
 */
export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
  format?: string;
}
