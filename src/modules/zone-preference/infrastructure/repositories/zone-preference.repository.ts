import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IZonePreferenceRepository,
  SetZonePreferenceData,
} from '../../domain/repositories/zone-preference.repository';
import {
  ZonePreference,
  ZonePreferenceType,
} from '../../domain/entities/zone-preference.entity';
import { ZonePolygon } from '../../../location/domain/entities/zone.entity';

type ZonePreferenceWithZone = Prisma.TransporterZonePreferenceGetPayload<{
  include: {
    zone: {
      include: {
        municipality: {
          include: {
            state: {
              include: {
                country: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ZonePreferenceRepository implements IZonePreferenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeZone = {
    zone: {
      include: {
        municipality: {
          include: {
            state: {
              include: {
                country: true,
              },
            },
          },
        },
      },
    },
  } as const;

  async setPreference(data: SetZonePreferenceData): Promise<ZonePreference> {
    const preference = await this.prisma.transporterZonePreference.upsert({
      where: {
        transporterId_zoneId: {
          transporterId: data.transporterId,
          zoneId: data.zoneId,
        },
      },
      update: {
        preference: data.preference,
      },
      create: {
        transporterId: data.transporterId,
        zoneId: data.zoneId,
        preference: data.preference,
      },
      include: this.includeZone,
    });
    return this.mapToEntity(preference);
  }

  async findByTransporter(transporterId: string): Promise<ZonePreference[]> {
    const preferences = await this.prisma.transporterZonePreference.findMany({
      where: { transporterId },
      include: this.includeZone,
      orderBy: { createdAt: 'desc' },
    });
    return preferences.map((p) => this.mapToEntity(p));
  }

  async findByTransporterAndZone(
    transporterId: string,
    zoneId: string,
  ): Promise<ZonePreference | null> {
    const preference = await this.prisma.transporterZonePreference.findUnique({
      where: {
        transporterId_zoneId: {
          transporterId,
          zoneId,
        },
      },
      include: this.includeZone,
    });
    return preference ? this.mapToEntity(preference) : null;
  }

  async deletePreference(transporterId: string, zoneId: string): Promise<void> {
    await this.prisma.transporterZonePreference.delete({
      where: {
        transporterId_zoneId: {
          transporterId,
          zoneId,
        },
      },
    });
  }

  async bulkSetPreferences(
    transporterId: string,
    preferences: { zoneId: string; preference: ZonePreferenceType }[],
  ): Promise<ZonePreference[]> {
    const result = await this.prisma.$transaction(async (tx) => {
      const results: ZonePreferenceWithZone[] = [];

      for (const pref of preferences) {
        const updated = await tx.transporterZonePreference.upsert({
          where: {
            transporterId_zoneId: {
              transporterId,
              zoneId: pref.zoneId,
            },
          },
          update: {
            preference: pref.preference,
          },
          create: {
            transporterId,
            zoneId: pref.zoneId,
            preference: pref.preference,
          },
          include: this.includeZone,
        });
        results.push(updated);
      }

      return results;
    });

    return result.map((r) => this.mapToEntity(r));
  }

  private mapToEntity(data: ZonePreferenceWithZone): ZonePreference {
    return {
      id: data.id,
      preference: data.preference as ZonePreferenceType,
      transporterId: data.transporterId,
      zoneId: data.zoneId,
      zone: {
        id: data.zone.id,
        name: data.zone.name,
        code: data.zone.code,
        latitude: data.zone.latitude ?? null,
        longitude: data.zone.longitude ?? null,
        polygon: (data.zone.polygon as unknown as ZonePolygon) ?? null,
        isActive: data.zone.isActive,
        municipalityId: data.zone.municipalityId,
        municipality: {
          id: data.zone.municipality.id,
          name: data.zone.municipality.name,
          code: data.zone.municipality.code,
          isActive: data.zone.municipality.isActive,
          stateId: data.zone.municipality.stateId,
          state: {
            id: data.zone.municipality.state.id,
            name: data.zone.municipality.state.name,
            code: data.zone.municipality.state.code,
            isActive: data.zone.municipality.state.isActive,
            countryId: data.zone.municipality.state.countryId,
            country: {
              id: data.zone.municipality.state.country.id,
              name: data.zone.municipality.state.country.name,
              code: data.zone.municipality.state.country.code,
              isActive: data.zone.municipality.state.country.isActive,
              createdAt: data.zone.municipality.state.country.createdAt,
              updatedAt: data.zone.municipality.state.country.updatedAt,
            },
            createdAt: data.zone.municipality.state.createdAt,
            updatedAt: data.zone.municipality.state.updatedAt,
          },
          createdAt: data.zone.municipality.createdAt,
          updatedAt: data.zone.municipality.updatedAt,
        },
        createdAt: data.zone.createdAt,
        updatedAt: data.zone.updatedAt,
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
