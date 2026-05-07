export interface PresignedPostParams {
  key: string;
  contentType: string;
  expiresIn: number;
  maxSize: number;
  tags: Record<string, string>;
}

export interface PresignedPostResult {
  url: string;
  fields: Record<string, string>;
  fileUrl: string;
}

export interface IS3Service {
  /**
   * Generates a presigned POST policy that constrains uploads to the
   * given key, content-type and content-length-range, forces SSE, and
   * applies the provided tags. Returns the form URL, the form fields
   * the client must include (signature, policy, etc.), and the public
   * URL the object will have once uploaded.
   */
  generatePresignedPost(
    params: PresignedPostParams,
  ): Promise<PresignedPostResult>;
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
