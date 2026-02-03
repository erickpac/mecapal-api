import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository } from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { IncidentNotFoundException } from '../../domain/exceptions';
import { UpdateIncidentDto } from '../dtos';

@Injectable()
export class UpdateIncidentUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(id: string, dto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.incidentRepository.findById(id);

    if (!incident) {
      throw new IncidentNotFoundException(id);
    }

    return this.incidentRepository.update(id, {
      status: dto.status,
      severity: dto.severity,
      internalNotes: dto.internalNotes,
      assignedToId: dto.assignedToId,
    });
  }
}
