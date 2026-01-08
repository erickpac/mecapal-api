import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOCATION_TOKENS } from '../../domain/constants/injection-tokens';
import { ILocationRepository } from '../../domain/repositories/location.repository';
import { Municipality } from '../../domain/entities/municipality.entity';
import {
  CreateMunicipalityDto,
  UpdateMunicipalityDto,
} from '../dtos/municipality.dto';

@Injectable()
export class CreateMunicipalityUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateMunicipalityDto): Promise<Municipality> {
    const state = await this.locationRepository.findStateById(dto.stateId);
    if (!state) {
      throw new NotFoundException(`State with ID ${dto.stateId} not found`);
    }

    return this.locationRepository.createMunicipality({
      name: dto.name,
      code: dto.code.toUpperCase(),
      stateId: dto.stateId,
    });
  }
}

@Injectable()
export class GetMunicipalitiesUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(stateId: string, activeOnly = false): Promise<Municipality[]> {
    return this.locationRepository.findMunicipalitiesByState(
      stateId,
      activeOnly,
    );
  }
}

@Injectable()
export class UpdateMunicipalityUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateMunicipalityDto): Promise<Municipality> {
    const municipality = await this.locationRepository.findMunicipalityById(id);
    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }

    return this.locationRepository.updateMunicipality(id, {
      name: dto.name,
      code: dto.code?.toUpperCase(),
    });
  }
}

@Injectable()
export class ToggleMunicipalityStatusUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string): Promise<Municipality> {
    const municipality = await this.locationRepository.findMunicipalityById(id);
    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }

    return this.locationRepository.toggleMunicipalityStatus(id);
  }
}
