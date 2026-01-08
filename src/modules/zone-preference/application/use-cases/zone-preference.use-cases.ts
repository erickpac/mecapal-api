import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ZONE_PREFERENCE_TOKENS } from '../../domain/constants/injection-tokens';
import { LOCATION_TOKENS } from '../../../location/domain/constants/injection-tokens';
import { IZonePreferenceRepository } from '../../domain/repositories/zone-preference.repository';
import { ILocationRepository } from '../../../location/domain/repositories/location.repository';
import { ZonePreference } from '../../domain/entities/zone-preference.entity';
import {
  SetZonePreferenceDto,
  BulkSetZonePreferencesDto,
} from '../dtos/zone-preference.dto';

@Injectable()
export class SetZonePreferenceUseCase {
  constructor(
    @Inject(ZONE_PREFERENCE_TOKENS.IZonePreferenceRepository)
    private readonly zonePreferenceRepository: IZonePreferenceRepository,
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(
    transporterId: string,
    dto: SetZonePreferenceDto,
  ): Promise<ZonePreference> {
    const zone = await this.locationRepository.findZoneById(dto.zoneId);
    if (!zone) {
      throw new NotFoundException(`Zone with ID ${dto.zoneId} not found`);
    }

    return this.zonePreferenceRepository.setPreference({
      transporterId,
      zoneId: dto.zoneId,
      preference: dto.preference,
    });
  }
}

@Injectable()
export class GetTransporterZonePreferencesUseCase {
  constructor(
    @Inject(ZONE_PREFERENCE_TOKENS.IZonePreferenceRepository)
    private readonly zonePreferenceRepository: IZonePreferenceRepository,
  ) {}

  async execute(transporterId: string): Promise<ZonePreference[]> {
    return this.zonePreferenceRepository.findByTransporter(transporterId);
  }
}

@Injectable()
export class DeleteZonePreferenceUseCase {
  constructor(
    @Inject(ZONE_PREFERENCE_TOKENS.IZonePreferenceRepository)
    private readonly zonePreferenceRepository: IZonePreferenceRepository,
  ) {}

  async execute(transporterId: string, zoneId: string): Promise<void> {
    const existing =
      await this.zonePreferenceRepository.findByTransporterAndZone(
        transporterId,
        zoneId,
      );
    if (!existing) {
      throw new NotFoundException(
        `Zone preference not found for zone ${zoneId}`,
      );
    }

    await this.zonePreferenceRepository.deletePreference(transporterId, zoneId);
  }
}

@Injectable()
export class BulkSetZonePreferencesUseCase {
  constructor(
    @Inject(ZONE_PREFERENCE_TOKENS.IZonePreferenceRepository)
    private readonly zonePreferenceRepository: IZonePreferenceRepository,
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(
    transporterId: string,
    dto: BulkSetZonePreferencesDto,
  ): Promise<ZonePreference[]> {
    // Validate all zones exist
    for (const pref of dto.preferences) {
      const zone = await this.locationRepository.findZoneById(pref.zoneId);
      if (!zone) {
        throw new NotFoundException(`Zone with ID ${pref.zoneId} not found`);
      }
    }

    return this.zonePreferenceRepository.bulkSetPreferences(
      transporterId,
      dto.preferences.map((p) => ({
        zoneId: p.zoneId,
        preference: p.preference,
      })),
    );
  }
}
