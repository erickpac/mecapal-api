import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { ApproveValidationDto } from '../dtos/approve-validation.dto';
import { SendValidationApprovalEmailUseCase } from '../../../email/application/use-cases/send-validation-approval-email.use-case';

@Injectable()
export class ApproveVehicleUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
    private readonly sendValidationApprovalEmail: SendValidationApprovalEmailUseCase,
  ) {}

  async execute(
    vehicleId: string,
    reviewerId: string,
    dto: ApproveValidationDto,
  ): Promise<ValidationLog> {
    const vehicle = await this.validationRepository.findVehicleById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Validate all checklist items are true
    const checklistValues = Object.values(dto.checklist);
    if (!checklistValues.every((value) => value === true)) {
      throw new BadRequestException('All checklist items must be checked to approve');
    }

    // Update vehicle status to ACTIVE
    await this.validationRepository.updateVehicleStatus(vehicleId, 'ACTIVE');

    const shouldSendEmail = dto.sendEmail ?? true;

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.VEHICLE,
      entityId: vehicleId,
      action: 'APPROVED',
      checklist: dto.checklist,
      reviewedBy: reviewerId,
      transporterId: vehicle.userId,
      emailSent: shouldSendEmail,
    });

    // Send email notification if enabled
    if (shouldSendEmail) {
      await this.sendValidationApprovalEmail.execute({
        transporterEmail: vehicle.user.email,
        transporterName: `${vehicle.user.firstName} ${vehicle.user.lastName}`,
        entityType: 'vehicle',
        entitySummary: `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.licensePlate}`,
      });
    }

    return validationLog;
  }
}
