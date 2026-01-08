import { Zone } from '../../../location/domain/entities/zone.entity';

export enum ZonePreferenceType {
  PREFERRED = 'PREFERRED',
  NEUTRAL = 'NEUTRAL',
  EXCLUDED = 'EXCLUDED',
}

export interface ZonePreference {
  id: string;
  preference: ZonePreferenceType;
  transporterId: string;
  zoneId: string;
  zone?: Zone;
  createdAt: Date;
  updatedAt: Date;
}
