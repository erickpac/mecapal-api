import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOCATION_TOKENS } from '../../domain/constants/injection-tokens';
import { ILocationRepository } from '../../domain/repositories/location.repository';
import { Zone, ZonePolygon } from '../../domain/entities/zone.entity';
import { CreateZoneDto, UpdateZoneDto } from '../dtos/zone.dto';

@Injectable()
export class CreateZoneUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateZoneDto): Promise<Zone> {
    const municipality = await this.locationRepository.findMunicipalityById(
      dto.municipalityId,
    );
    if (!municipality) {
      throw new NotFoundException(
        `Municipality with ID ${dto.municipalityId} not found`,
      );
    }

    return this.locationRepository.createZone({
      name: dto.name,
      postalCode: dto.postalCode.toUpperCase(),
      municipalityId: dto.municipalityId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      polygon: dto.polygon as ZonePolygon,
    });
  }
}

@Injectable()
export class GetZonesUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(municipalityId: string, activeOnly = false): Promise<Zone[]> {
    return this.locationRepository.findZonesByMunicipality(
      municipalityId,
      activeOnly,
    );
  }
}

@Injectable()
export class GetAllZonesUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(search?: string, activeOnly = false): Promise<Zone[]> {
    return this.locationRepository.findAllZones(search, activeOnly);
  }
}

@Injectable()
export class UpdateZoneUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateZoneDto): Promise<Zone> {
    const zone = await this.locationRepository.findZoneById(id);
    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return this.locationRepository.updateZone(id, {
      name: dto.name,
      postalCode: dto.postalCode?.toUpperCase(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      polygon: dto.polygon as ZonePolygon,
    });
  }
}

@Injectable()
export class ToggleZoneStatusUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string): Promise<Zone> {
    const zone = await this.locationRepository.findZoneById(id);
    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    return this.locationRepository.toggleZoneStatus(id);
  }
}
