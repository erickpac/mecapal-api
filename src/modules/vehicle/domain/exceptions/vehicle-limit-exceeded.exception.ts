import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class VehicleLimitExceededException extends DomainException {
  constructor(limit: number) {
    super(
      `Maximum number of vehicles (${limit}) has been reached`,
      ErrorCode.VEHICLE_LIMIT_EXCEEDED,
      HttpStatus.CONFLICT,
    );
  }
}
