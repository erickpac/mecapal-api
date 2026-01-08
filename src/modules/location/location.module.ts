import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';

// Domain
import { LOCATION_TOKENS } from './domain/constants/injection-tokens';

// Use Cases - Country
import {
  CreateCountryUseCase,
  GetCountriesUseCase,
  UpdateCountryUseCase,
  ToggleCountryStatusUseCase,
} from './application/use-cases/country.use-cases';

// Use Cases - State
import {
  CreateStateUseCase,
  GetStatesUseCase,
  UpdateStateUseCase,
  ToggleStateStatusUseCase,
} from './application/use-cases/state.use-cases';

// Use Cases - Municipality
import {
  CreateMunicipalityUseCase,
  GetMunicipalitiesUseCase,
  UpdateMunicipalityUseCase,
  ToggleMunicipalityStatusUseCase,
} from './application/use-cases/municipality.use-cases';

// Use Cases - Zone
import {
  CreateZoneUseCase,
  GetZonesUseCase,
  GetAllZonesUseCase,
  UpdateZoneUseCase,
  ToggleZoneStatusUseCase,
} from './application/use-cases/zone.use-cases';

// Infrastructure
import { LocationRepository } from './infrastructure/repositories/location.repository';
import { CountryController } from './infrastructure/controllers/country.controller';
import { StateController } from './infrastructure/controllers/state.controller';
import { MunicipalityController } from './infrastructure/controllers/municipality.controller';
import { ZoneController } from './infrastructure/controllers/zone.controller';

const useCases = [
  // Country
  CreateCountryUseCase,
  GetCountriesUseCase,
  UpdateCountryUseCase,
  ToggleCountryStatusUseCase,
  // State
  CreateStateUseCase,
  GetStatesUseCase,
  UpdateStateUseCase,
  ToggleStateStatusUseCase,
  // Municipality
  CreateMunicipalityUseCase,
  GetMunicipalitiesUseCase,
  UpdateMunicipalityUseCase,
  ToggleMunicipalityStatusUseCase,
  // Zone
  CreateZoneUseCase,
  GetZonesUseCase,
  GetAllZonesUseCase,
  UpdateZoneUseCase,
  ToggleZoneStatusUseCase,
];

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [
    CountryController,
    StateController,
    MunicipalityController,
    ZoneController,
  ],
  providers: [
    ...useCases,
    {
      provide: LOCATION_TOKENS.ILocationRepository,
      useClass: LocationRepository,
    },
  ],
  exports: [...useCases, LOCATION_TOKENS.ILocationRepository],
})
export class LocationModule {}
