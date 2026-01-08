import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';
import { Municipality } from '../entities/municipality.entity';
import { Zone, ZonePolygon } from '../entities/zone.entity';

// Country
export interface CreateCountryData {
  name: string;
  code: string;
}

export interface UpdateCountryData {
  name?: string;
  code?: string;
}

// State
export interface CreateStateData {
  name: string;
  code: string;
  countryId: string;
}

export interface UpdateStateData {
  name?: string;
  code?: string;
}

// Municipality
export interface CreateMunicipalityData {
  name: string;
  code: string;
  stateId: string;
}

export interface UpdateMunicipalityData {
  name?: string;
  code?: string;
}

// Zone
export interface CreateZoneData {
  name: string;
  code: string;
  municipalityId: string;
  latitude?: number;
  longitude?: number;
  polygon?: ZonePolygon;
}

export interface UpdateZoneData {
  name?: string;
  code?: string;
  latitude?: number;
  longitude?: number;
  polygon?: ZonePolygon;
}

export interface ILocationRepository {
  // Country
  createCountry(data: CreateCountryData): Promise<Country>;
  findAllCountries(activeOnly?: boolean): Promise<Country[]>;
  findCountryById(id: string): Promise<Country | null>;
  updateCountry(id: string, data: UpdateCountryData): Promise<Country>;
  toggleCountryStatus(id: string): Promise<Country>;

  // State
  createState(data: CreateStateData): Promise<State>;
  findStatesByCountry(
    countryId: string,
    activeOnly?: boolean,
  ): Promise<State[]>;
  findStateById(id: string): Promise<State | null>;
  updateState(id: string, data: UpdateStateData): Promise<State>;
  toggleStateStatus(id: string): Promise<State>;

  // Municipality
  createMunicipality(data: CreateMunicipalityData): Promise<Municipality>;
  findMunicipalitiesByState(
    stateId: string,
    activeOnly?: boolean,
  ): Promise<Municipality[]>;
  findMunicipalityById(id: string): Promise<Municipality | null>;
  updateMunicipality(
    id: string,
    data: UpdateMunicipalityData,
  ): Promise<Municipality>;
  toggleMunicipalityStatus(id: string): Promise<Municipality>;

  // Zone
  createZone(data: CreateZoneData): Promise<Zone>;
  findZonesByMunicipality(
    municipalityId: string,
    activeOnly?: boolean,
  ): Promise<Zone[]>;
  findZoneById(id: string): Promise<Zone | null>;
  findAllZones(search?: string, activeOnly?: boolean): Promise<Zone[]>;
  updateZone(id: string, data: UpdateZoneData): Promise<Zone>;
  toggleZoneStatus(id: string): Promise<Zone>;
}
