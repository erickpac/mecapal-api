import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class IncidentNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(
      `Incident with identifier "${identifier}" not found`,
      ErrorCode.INCIDENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
