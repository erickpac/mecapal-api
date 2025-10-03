/**
 * Image Upload Service Interface
 * Abstraction for image upload operations
 */
export interface IImageUploadService {
  /**
   * Upload an image and return the URL
   * @param imageBuffer - The image buffer to upload
   * @param folder - The cloudinary folder to upload to
   * @returns Promise with the uploaded image URL
   */
  uploadImage(imageBuffer: Buffer, folder: string): Promise<string>;

  /**
   * Delete an image by URL
   * @param imageUrl - The URL of the image to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteImage(imageUrl: string): Promise<void>;
}
