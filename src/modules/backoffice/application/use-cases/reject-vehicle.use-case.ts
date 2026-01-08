import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { RejectValidationDto } from '../dtos/reject-validation.dto';
import { SendValidationRejectionEmailUseCase } from '../../../email/application/use-cases/send-validation-rejection-email.use-case';

@Injectable()
export class RejectVehicleUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
    private readonly sendValidationRejectionEmail: SendValidationRejectionEmailUseCase,
  ) {}

  async execute(
    vehicleId: string,
    reviewerId: string,
    dto: RejectValidationDto,
  ): Promise<ValidationLog> {
    const vehicle = await this.validationRepository.findVehicleById(vehicleId);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Update vehicle status to SUSPENDED
    await this.validationRepository.updateVehicleStatus(vehicleId, 'SUSPENDED');

    const shouldSendEmail = dto.sendEmail ?? true;

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.VEHICLE,
      entityId: vehicleId,
      action: 'REJECTED',
      rejectionCategory: dto.category,
      rejectionDetails: dto.details,
      reviewedBy: reviewerId,
      transporterId: vehicle.userId,
      emailSent: shouldSendEmail,
    });

    // Send email notification if enabled
    if (shouldSendEmail) {
      await this.sendValidationRejectionEmail.execute({
        transporterEmail: vehicle.user.email,
        transporterName: `${vehicle.user.firstName} ${vehicle.user.lastName}`,
        entityType: 'vehicle',
        rejectionCategory: dto.category,
        rejectionDetails: dto.details,
        entitySummary: `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.licensePlate}`,
      });
    }

    return validationLog;
  }
}
