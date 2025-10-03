/**
 * File upload type for image uploads
 * Used across the application for consistent file handling
 */
export interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
