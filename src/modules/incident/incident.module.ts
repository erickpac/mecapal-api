import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';

// Controller
import { IncidentController } from './infrastructure/controllers/incident.controller';

// Repository
import { IncidentRepository } from './infrastructure/repositories/incident.repository';

// Use Cases
import {
  CreateIncidentUseCase,
  GetIncidentsUseCase,
  GetIncidentUseCase,
  UpdateIncidentUseCase,
  ResolveIncidentUseCase,
  GetIncidentStatsUseCase,
} from './application/use-cases';

// Tokens
import { INCIDENT_TOKENS } from './domain/constants';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [IncidentController],
  providers: [
    // Repository
    {
      provide: INCIDENT_TOKENS.IIncidentRepository,
      useClass: IncidentRepository,
    },

    // Use Cases
    CreateIncidentUseCase,
    GetIncidentsUseCase,
    GetIncidentUseCase,
    UpdateIncidentUseCase,
    ResolveIncidentUseCase,
    GetIncidentStatsUseCase,
  ],
  exports: [
    INCIDENT_TOKENS.IIncidentRepository,
    CreateIncidentUseCase,
    GetIncidentsUseCase,
    GetIncidentUseCase,
  ],
})
export class IncidentModule {}
