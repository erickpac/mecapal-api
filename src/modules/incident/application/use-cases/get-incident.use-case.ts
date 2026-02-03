import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository } from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { IncidentNotFoundException } from '../../domain/exceptions';

@Injectable()
export class GetIncidentUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(id: string): Promise<Incident> {
    const incident = await this.incidentRepository.findById(id);

    if (!incident) {
      throw new IncidentNotFoundException(id);
    }

    return incident;
  }
}
