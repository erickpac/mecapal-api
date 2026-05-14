import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class VehicleInUseException extends DomainException {
  constructor(vehicleId: string) {
    super(
      `Cannot delete vehicle ${vehicleId}: it is being used by active delivery offers`,
      ErrorCode.VEHICLE_IN_USE,
      HttpStatus.CONFLICT,
    );
  }
}
