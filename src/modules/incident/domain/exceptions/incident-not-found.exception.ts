import { NotFoundException } from '@nestjs/common';

export class IncidentNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Incident with identifier "${identifier}" not found`);
  }
}
