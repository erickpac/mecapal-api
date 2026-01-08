import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { ApproveValidationDto } from '../dtos/approve-validation.dto';
import { SendValidationApprovalEmailUseCase } from '../../../email/application/use-cases/send-validation-approval-email.use-case';

@Injectable()
export class ApproveTransporterProfileUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
    private readonly sendValidationApprovalEmail: SendValidationApprovalEmailUseCase,
  ) {}

  async execute(
    profileId: string,
    reviewerId: string,
    dto: ApproveValidationDto,
  ): Promise<ValidationLog> {
    const profile = await this.validationRepository.findTransporterProfileById(profileId);

    if (!profile) {
      throw new NotFoundException(`Transporter profile with ID ${profileId} not found`);
    }

    // Validate all checklist items are true
    const checklistValues = Object.values(dto.checklist);
    if (!checklistValues.every((value) => value === true)) {
      throw new BadRequestException('All checklist items must be checked to approve');
    }

    // Update profile status to ACTIVE
    await this.validationRepository.updateTransporterProfileStatus(profileId, 'ACTIVE');

    const shouldSendEmail = dto.sendEmail ?? true;

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.TRANSPORTER_PROFILE,
      entityId: profileId,
      action: 'APPROVED',
      checklist: dto.checklist,
      reviewedBy: reviewerId,
      transporterId: profile.userId,
      emailSent: shouldSendEmail,
    });

    // Send email notification if enabled
    if (shouldSendEmail) {
      await this.sendValidationApprovalEmail.execute({
        transporterEmail: profile.user.email,
        transporterName: `${profile.user.firstName} ${profile.user.lastName}`,
        entityType: 'profile',
        entitySummary: `Licencia: ${profile.licenseNumber} - ${profile.city}, ${profile.state}`,
      });
    }

    return validationLog;
  }
}
