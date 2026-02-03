import { Injectable, Inject } from '@nestjs/common';
import { INCIDENT_TOKENS } from '../../domain/constants';
import { IIncidentRepository } from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { CreateIncidentDto } from '../dtos';

@Injectable()
export class CreateIncidentUseCase {
  constructor(
    @Inject(INCIDENT_TOKENS.IIncidentRepository)
    private readonly incidentRepository: IIncidentRepository,
  ) {}

  async execute(reportedById: string, dto: CreateIncidentDto): Promise<Incident> {
    return this.incidentRepository.create({
      type: dto.type,
      severity: dto.severity,
      description: dto.description,
      evidenceUrls: dto.evidenceUrls,
      reportedById,
      reportedAgainstId: dto.reportedAgainstId,
      orderId: dto.orderId,
    });
  }
}
