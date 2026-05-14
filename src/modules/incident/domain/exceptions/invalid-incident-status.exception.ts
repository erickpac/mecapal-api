import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class InvalidIncidentStatusException extends DomainException {
  constructor(currentStatus: string, expectedStatuses: string[]) {
    super(
      `Cannot perform this action. Incident status is "${currentStatus}", expected one of: ${expectedStatuses.join(', ')}`,
      ErrorCode.INVALID_INCIDENT_STATUS,
      HttpStatus.BAD_REQUEST,
    );
  }
}
