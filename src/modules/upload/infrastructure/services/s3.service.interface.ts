export interface PresignedUrlParams {
  key: string;
  contentType: string;
  expiresIn: number;
  maxSize: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
}

export interface IS3Service {
  generatePresignedUrl(params: PresignedUrlParams): Promise<PresignedUrlResult>;
  /**
   * Deletes the given object keys from the bucket. Missing keys are
   * ignored (S3 delete is idempotent). Accepts up to 1000 keys per call.
   */
  deleteObjects(keys: string[]): Promise<void>;
  /**
   * Extracts the object key from a full S3 URL or returns null if the
   * URL does not belong to the configured bucket.
   */
  extractKeyFromUrl(url: string): string | null;
}
