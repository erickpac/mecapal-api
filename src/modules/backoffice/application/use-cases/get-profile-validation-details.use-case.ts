import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';

@Injectable()
export class GetProfileValidationDetailsUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
  ) {}

  async execute(profileId: string): Promise<unknown> {
    const profile =
      await this.validationRepository.findTransporterProfileById(profileId);

    if (!profile) {
      throw new NotFoundException(
        `Transporter profile with ID ${profileId} not found`,
      );
    }

    return profile;
  }
}
