import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository, IncidentFilters } from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { IncidentQueryDto } from '../dtos';

@Injectable()
export class GetIncidentsUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(query: IncidentQueryDto): Promise<Incident[]> {
    const filters: IncidentFilters = {
      status: query.status,
      severity: query.severity,
      type: query.type,
      reportedById: query.reportedById,
      reportedAgainstId: query.reportedAgainstId,
      assignedToId: query.assignedToId,
      orderId: query.orderId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    };

    return this.incidentRepository.findByFilters(filters);
  }
}
