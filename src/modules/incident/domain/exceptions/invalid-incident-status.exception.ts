import { BadRequestException } from '@nestjs/common';

export class InvalidIncidentStatusException extends BadRequestException {
  constructor(currentStatus: string, expectedStatuses: string[]) {
    super(
      `Cannot perform this action. Incident status is "${currentStatus}", expected one of: ${expectedStatuses.join(', ')}`,
    );
  }
}
