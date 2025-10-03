import { DomainException } from './domain.exception';

export class VehicleNotFoundException extends DomainException {
  constructor(vehicleId: string) {
    super(`Vehicle with ID ${vehicleId} not found`, 'VEHICLE_NOT_FOUND');
  }
}
