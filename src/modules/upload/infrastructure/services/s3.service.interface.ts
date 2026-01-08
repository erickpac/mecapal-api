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
}
