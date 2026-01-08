import {
  ZonePreference,
  ZonePreferenceType,
} from '../entities/zone-preference.entity';

export interface SetZonePreferenceData {
  transporterId: string;
  zoneId: string;
  preference: ZonePreferenceType;
}

export interface IZonePreferenceRepository {
  setPreference(data: SetZonePreferenceData): Promise<ZonePreference>;
  findByTransporter(transporterId: string): Promise<ZonePreference[]>;
  findByTransporterAndZone(
    transporterId: string,
    zoneId: string,
  ): Promise<ZonePreference | null>;
  deletePreference(transporterId: string, zoneId: string): Promise<void>;
  bulkSetPreferences(
    transporterId: string,
    preferences: { zoneId: string; preference: ZonePreferenceType }[],
  ): Promise<ZonePreference[]>;
}
