import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { LocationModule } from '../location/location.module';

// Domain
import { ZONE_PREFERENCE_TOKENS } from './domain/constants/injection-tokens';

// Use Cases
import {
  SetZonePreferenceUseCase,
  GetTransporterZonePreferencesUseCase,
  DeleteZonePreferenceUseCase,
  BulkSetZonePreferencesUseCase,
} from './application/use-cases/zone-preference.use-cases';

// Infrastructure
import { ZonePreferenceRepository } from './infrastructure/repositories/zone-preference.repository';
import { ZonePreferenceController } from './infrastructure/controllers/zone-preference.controller';

const useCases = [
  SetZonePreferenceUseCase,
  GetTransporterZonePreferencesUseCase,
  DeleteZonePreferenceUseCase,
  BulkSetZonePreferencesUseCase,
];

@Module({
  imports: [PrismaModule, CognitoModule, LocationModule],
  controllers: [ZonePreferenceController],
  providers: [
    ...useCases,
    {
      provide: ZONE_PREFERENCE_TOKENS.IZonePreferenceRepository,
      useClass: ZonePreferenceRepository,
    },
  ],
  exports: [...useCases],
})
export class ZonePreferenceModule {}
