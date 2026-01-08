import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOCATION_TOKENS } from '../../domain/constants/injection-tokens';
import { ILocationRepository } from '../../domain/repositories/location.repository';
import { State } from '../../domain/entities/state.entity';
import { CreateStateDto, UpdateStateDto } from '../dtos/state.dto';

@Injectable()
export class CreateStateUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateStateDto): Promise<State> {
    const country = await this.locationRepository.findCountryById(
      dto.countryId,
    );
    if (!country) {
      throw new NotFoundException(`Country with ID ${dto.countryId} not found`);
    }

    return this.locationRepository.createState({
      name: dto.name,
      code: dto.code.toUpperCase(),
      countryId: dto.countryId,
    });
  }
}

@Injectable()
export class GetStatesUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(countryId: string, activeOnly = false): Promise<State[]> {
    return this.locationRepository.findStatesByCountry(countryId, activeOnly);
  }
}

@Injectable()
export class UpdateStateUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateStateDto): Promise<State> {
    const state = await this.locationRepository.findStateById(id);
    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return this.locationRepository.updateState(id, {
      name: dto.name,
      code: dto.code?.toUpperCase(),
    });
  }
}

@Injectable()
export class ToggleStateStatusUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string): Promise<State> {
    const state = await this.locationRepository.findStateById(id);
    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return this.locationRepository.toggleStateStatus(id);
  }
}
