import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { RejectValidationDto } from '../dtos/reject-validation.dto';

@Injectable()
export class RejectTransporterProfileUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
  ) {}

  async execute(
    profileId: string,
    reviewerId: string,
    dto: RejectValidationDto,
  ): Promise<ValidationLog> {
    const profile = await this.validationRepository.findTransporterProfileById(profileId) as { userId: string } | null;

    if (!profile) {
      throw new NotFoundException(`Transporter profile with ID ${profileId} not found`);
    }

    // Update profile status to SUSPENDED
    await this.validationRepository.updateTransporterProfileStatus(profileId, 'SUSPENDED');

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.TRANSPORTER_PROFILE,
      entityId: profileId,
      action: 'REJECTED',
      rejectionCategory: dto.category,
      rejectionDetails: dto.details,
      reviewedBy: reviewerId,
      transporterId: profile.userId,
      emailSent: dto.sendEmail ?? true,
    });

    // TODO: Send email notification if dto.sendEmail is true

    return validationLog;
  }
}
