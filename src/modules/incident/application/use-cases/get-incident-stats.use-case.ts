import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository, IncidentStats } from '../../domain/interfaces';

@Injectable()
export class GetIncidentStatsUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(): Promise<IncidentStats> {
    return this.incidentRepository.getStats();
  }
}
