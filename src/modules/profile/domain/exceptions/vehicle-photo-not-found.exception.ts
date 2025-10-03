import { DomainException } from './domain.exception';

export class VehiclePhotoNotFoundException extends DomainException {
  constructor(photoId: string) {
    super(
      `Vehicle photo with ID ${photoId} not found`,
      'VEHICLE_PHOTO_NOT_FOUND',
    );
  }
}
