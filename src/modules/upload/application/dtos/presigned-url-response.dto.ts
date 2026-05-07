export class PresignedUrlResponseDto {
  /** The S3 endpoint the client must POST a multipart form to. */
  url: string;
  /**
   * Form fields the client must include (signature, policy, key,
   * Content-Type, server-side-encryption, tagging, etc). The actual
   * file must be added LAST under the field name "file".
   */
  fields: Record<string, string>;
  /** Public URL the object will have once the upload completes. */
  fileUrl: string;
  expiresIn: number;
}
