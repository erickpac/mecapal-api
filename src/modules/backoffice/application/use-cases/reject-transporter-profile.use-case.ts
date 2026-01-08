import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { RejectValidationDto } from '../dtos/reject-validation.dto';
import { SendValidationRejectionEmailUseCase } from '../../../email/application/use-cases/send-validation-rejection-email.use-case';

@Injectable()
export class RejectTransporterProfileUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
    private readonly sendValidationRejectionEmail: SendValidationRejectionEmailUseCase,
  ) {}

  async execute(
    profileId: string,
    reviewerId: string,
    dto: RejectValidationDto,
  ): Promise<ValidationLog> {
    const profile =
      await this.validationRepository.findTransporterProfileById(profileId);

    if (!profile) {
      throw new NotFoundException(
        `Transporter profile with ID ${profileId} not found`,
      );
    }

    // Update profile status to SUSPENDED
    await this.validationRepository.updateTransporterProfileStatus(
      profileId,
      'SUSPENDED',
    );

    const shouldSendEmail = dto.sendEmail ?? true;

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.TRANSPORTER_PROFILE,
      entityId: profileId,
      action: 'REJECTED',
      rejectionCategory: dto.category,
      rejectionDetails: dto.details,
      reviewedBy: reviewerId,
      transporterId: profile.userId,
      emailSent: shouldSendEmail,
    });

    // Send email notification if enabled
    if (shouldSendEmail) {
      await this.sendValidationRejectionEmail.execute({
        transporterEmail: profile.user.email,
        transporterName: `${profile.user.firstName} ${profile.user.lastName}`,
        entityType: 'profile',
        rejectionCategory: dto.category,
        rejectionDetails: dto.details,
        entitySummary: `Licencia: ${profile.licenseNumber} - ${profile.city}, ${profile.state}`,
      });
    }

    return validationLog;
  }
}
