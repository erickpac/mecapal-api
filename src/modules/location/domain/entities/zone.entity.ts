import { Municipality } from './municipality.entity';

export interface ZonePolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export class Zone {
  id: string;
  name: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
  polygon: ZonePolygon | null;
  isActive: boolean;
  municipalityId: string;
  municipality?: Municipality;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Zone>) {
    Object.assign(this, partial);
  }
}
