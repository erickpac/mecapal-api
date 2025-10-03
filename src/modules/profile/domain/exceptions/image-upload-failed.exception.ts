import { DomainException } from './domain.exception';

export class ImageUploadFailedException extends DomainException {
  constructor(reason?: string) {
    const message = reason
      ? `Image upload failed: ${reason}`
      : 'Image upload failed';
    super(message, 'IMAGE_UPLOAD_FAILED');
  }
}
