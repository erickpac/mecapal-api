import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';

@Injectable()
export class GetVehicleValidationDetailsUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
  ) {}

  async execute(vehicleId: string): Promise<unknown> {
    const vehicle = await this.validationRepository.findVehicleById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    return vehicle;
  }
}
