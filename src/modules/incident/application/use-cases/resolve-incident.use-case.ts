import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository } from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { IncidentStatus } from '../../domain/enums';
import {
  IncidentNotFoundException,
  InvalidIncidentStatusException,
} from '../../domain/exceptions';
import { ResolveIncidentDto } from '../dtos';

@Injectable()
export class ResolveIncidentUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(id: string, dto: ResolveIncidentDto): Promise<Incident> {
    const incident = await this.incidentRepository.findById(id);

    if (!incident) {
      throw new IncidentNotFoundException(id);
    }

    // Can only resolve incidents that are OPEN or INVESTIGATING
    const validStatuses = [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING];
    if (!validStatuses.includes(incident.status)) {
      throw new InvalidIncidentStatusException(incident.status, validStatuses);
    }

    return this.incidentRepository.resolve(id, {
      resolution: dto.resolution,
      resolutionNotes: dto.resolutionNotes,
      refundAmount: dto.refundAmount,
      userAction: dto.userAction,
    });
  }
}
