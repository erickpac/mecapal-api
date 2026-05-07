import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ILocationRepository,
  CreateCountryData,
  UpdateCountryData,
  CreateStateData,
  UpdateStateData,
  CreateMunicipalityData,
  UpdateMunicipalityData,
  CreateZoneData,
  UpdateZoneData,
} from '../../domain/repositories/location.repository';
import { Country } from '../../domain/entities/country.entity';
import { State } from '../../domain/entities/state.entity';
import { Municipality } from '../../domain/entities/municipality.entity';
import { Zone, ZonePolygon } from '../../domain/entities/zone.entity';

@Injectable()
export class LocationRepository implements ILocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Country
  async createCountry(data: CreateCountryData): Promise<Country> {
    const country = await this.prisma.country.create({ data });
    return this.mapToCountry(country);
  }

  async findAllCountries(activeOnly = false): Promise<Country[]> {
    const countries = await this.prisma.country.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
    return countries.map((c) => this.mapToCountry(c));
  }

  async findCountryById(id: string): Promise<Country | null> {
    const country = await this.prisma.country.findUnique({ where: { id } });
    return country ? this.mapToCountry(country) : null;
  }

  async updateCountry(id: string, data: UpdateCountryData): Promise<Country> {
    const country = await this.prisma.country.update({
      where: { id },
      data,
    });
    return this.mapToCountry(country);
  }

  async toggleCountryStatus(id: string): Promise<Country> {
    const current = await this.prisma.country.findUnique({ where: { id } });
    const country = await this.prisma.country.update({
      where: { id },
      data: { isActive: !current?.isActive },
    });
    return this.mapToCountry(country);
  }

  // State
  async createState(data: CreateStateData): Promise<State> {
    const state = await this.prisma.state.create({
      data,
      include: { country: true },
    });
    return this.mapToState(state);
  }

  async findStatesByCountry(
    countryId: string,
    activeOnly = false,
  ): Promise<State[]> {
    const states = await this.prisma.state.findMany({
      where: {
        countryId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: { country: true },
      orderBy: { name: 'asc' },
    });
    return states.map((s) => this.mapToState(s));
  }

  async findStateById(id: string): Promise<State | null> {
    const state = await this.prisma.state.findUnique({
      where: { id },
      include: { country: true },
    });
    return state ? this.mapToState(state) : null;
  }

  async updateState(id: string, data: UpdateStateData): Promise<State> {
    const state = await this.prisma.state.update({
      where: { id },
      data,
      include: { country: true },
    });
    return this.mapToState(state);
  }

  async toggleStateStatus(id: string): Promise<State> {
    const current = await this.prisma.state.findUnique({ where: { id } });
    const state = await this.prisma.state.update({
      where: { id },
      data: { isActive: !current?.isActive },
      include: { country: true },
    });
    return this.mapToState(state);
  }

  // Municipality
  async createMunicipality(
    data: CreateMunicipalityData,
  ): Promise<Municipality> {
    const municipality = await this.prisma.municipality.create({
      data,
      include: { state: { include: { country: true } } },
    });
    return this.mapToMunicipality(municipality);
  }

  async findMunicipalitiesByState(
    stateId: string,
    activeOnly = false,
  ): Promise<Municipality[]> {
    const municipalities = await this.prisma.municipality.findMany({
      where: {
        stateId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: { state: { include: { country: true } } },
      orderBy: { name: 'asc' },
    });
    return municipalities.map((m) => this.mapToMunicipality(m));
  }

  async findMunicipalityById(id: string): Promise<Municipality | null> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id },
      include: { state: { include: { country: true } } },
    });
    return municipality ? this.mapToMunicipality(municipality) : null;
  }

  async updateMunicipality(
    id: string,
    data: UpdateMunicipalityData,
  ): Promise<Municipality> {
    const municipality = await this.prisma.municipality.update({
      where: { id },
      data,
      include: { state: { include: { country: true } } },
    });
    return this.mapToMunicipality(municipality);
  }

  async toggleMunicipalityStatus(id: string): Promise<Municipality> {
    const current = await this.prisma.municipality.findUnique({
      where: { id },
    });
    const municipality = await this.prisma.municipality.update({
      where: { id },
      data: { isActive: !current?.isActive },
      include: { state: { include: { country: true } } },
    });
    return this.mapToMunicipality(municipality);
  }

  // Zone
  async createZone(data: CreateZoneData): Promise<Zone> {
    const zone = await this.prisma.zone.create({
      data: {
        name: data.name,
        postalCode: data.postalCode,
        municipalityId: data.municipalityId,
        latitude: data.latitude,
        longitude: data.longitude,
        polygon: data.polygon as object,
      },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    return this.mapToZone(zone);
  }

  async findZonesByMunicipality(
    municipalityId: string,
    activeOnly = false,
  ): Promise<Zone[]> {
    const zones = await this.prisma.zone.findMany({
      where: {
        municipalityId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    // Natural numeric sort so "Zona 2" comes before "Zona 10".
    const collator = new Intl.Collator(undefined, { numeric: true });
    zones.sort((a, b) => collator.compare(a.name, b.name));
    return zones.map((z) => this.mapToZone(z));
  }

  async findZoneById(id: string): Promise<Zone | null> {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    return zone ? this.mapToZone(zone) : null;
  }

  async findAllZones(search?: string, activeOnly = false): Promise<Zone[]> {
    const zones = await this.prisma.zone.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { postalCode: { contains: search, mode: 'insensitive' } },
                {
                  municipality: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    // Natural numeric sort so "Zona 2" comes before "Zona 10".
    const collator = new Intl.Collator(undefined, { numeric: true });
    zones.sort((a, b) => collator.compare(a.name, b.name));
    return zones.map((z) => this.mapToZone(z));
  }

  async updateZone(id: string, data: UpdateZoneData): Promise<Zone> {
    const zone = await this.prisma.zone.update({
      where: { id },
      data: {
        name: data.name,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        polygon: data.polygon as object,
      },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    return this.mapToZone(zone);
  }

  async toggleZoneStatus(id: string): Promise<Zone> {
    const current = await this.prisma.zone.findUnique({ where: { id } });
    const zone = await this.prisma.zone.update({
      where: { id },
      data: { isActive: !current?.isActive },
      include: {
        municipality: { include: { state: { include: { country: true } } } },
      },
    });
    return this.mapToZone(zone);
  }

  // Mappers
  private mapToCountry(data: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Country {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToState(data: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    countryId: string;
    country: {
      id: string;
      name: string;
      code: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }): State {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isActive: data.isActive,
      countryId: data.countryId,
      country: this.mapToCountry(data.country),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToMunicipality(data: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    stateId: string;
    state: {
      id: string;
      name: string;
      code: string;
      isActive: boolean;
      countryId: string;
      country: {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }): Municipality {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      isActive: data.isActive,
      stateId: data.stateId,
      state: this.mapToState(data.state),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToZone(data: {
    id: string;
    name: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
    polygon: unknown;
    isActive: boolean;
    municipalityId: string;
    municipality: {
      id: string;
      name: string;
      code: string;
      isActive: boolean;
      stateId: string;
      state: {
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        countryId: string;
        country: {
          id: string;
          name: string;
          code: string;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        createdAt: Date;
        updatedAt: Date;
      };
      createdAt: Date;
      updatedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }): Zone {
    return {
      id: data.id,
      name: data.name,
      postalCode: data.postalCode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      polygon: (data.polygon as ZonePolygon) ?? null,
      isActive: data.isActive,
      municipalityId: data.municipalityId,
      municipality: this.mapToMunicipality(data.municipality),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
