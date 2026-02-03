import { ConflictException } from '@nestjs/common';

export class VehicleInUseException extends ConflictException {
  constructor(vehicleId: string) {
    super(
      `Cannot delete vehicle ${vehicleId}: it is being used by active delivery offers`,
    );
  }
}
