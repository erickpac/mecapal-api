import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class VehicleNotFoundException extends DomainException {
  constructor(vehicleId: string) {
    super(
      `Vehicle with ID ${vehicleId} not found`,
      ErrorCode.VEHICLE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
