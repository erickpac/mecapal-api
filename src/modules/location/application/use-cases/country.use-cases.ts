import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LOCATION_TOKENS } from '../../domain/constants/injection-tokens';
import { ILocationRepository } from '../../domain/repositories/location.repository';
import { Country } from '../../domain/entities/country.entity';
import { CreateCountryDto, UpdateCountryDto } from '../dtos/country.dto';

@Injectable()
export class CreateCountryUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(dto: CreateCountryDto): Promise<Country> {
    return this.locationRepository.createCountry({
      name: dto.name,
      code: dto.code.toUpperCase(),
    });
  }
}

@Injectable()
export class GetCountriesUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(activeOnly = false): Promise<Country[]> {
    return this.locationRepository.findAllCountries(activeOnly);
  }
}

@Injectable()
export class UpdateCountryUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string, dto: UpdateCountryDto): Promise<Country> {
    const country = await this.locationRepository.findCountryById(id);
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return this.locationRepository.updateCountry(id, {
      name: dto.name,
      code: dto.code?.toUpperCase(),
    });
  }
}

@Injectable()
export class ToggleCountryStatusUseCase {
  constructor(
    @Inject(LOCATION_TOKENS.ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(id: string): Promise<Country> {
    const country = await this.locationRepository.findCountryById(id);
    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return this.locationRepository.toggleCountryStatus(id);
  }
}
