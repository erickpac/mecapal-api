import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import { IValidationRepository } from '../../domain/repositories/validation.repository';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { RejectValidationDto } from '../dtos/reject-validation.dto';

@Injectable()
export class RejectVehicleUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
  ) {}

  async execute(
    vehicleId: string,
    reviewerId: string,
    dto: RejectValidationDto,
  ): Promise<ValidationLog> {
    const vehicle = await this.validationRepository.findVehicleById(vehicleId) as { userId: string } | null;

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    // Update vehicle status to SUSPENDED
    await this.validationRepository.updateVehicleStatus(vehicleId, 'SUSPENDED');

    // Create validation log
    const validationLog = await this.validationRepository.createValidationLog({
      entityType: ValidationEntityType.VEHICLE,
      entityId: vehicleId,
      action: 'REJECTED',
      rejectionCategory: dto.category,
      rejectionDetails: dto.details,
      reviewedBy: reviewerId,
      transporterId: vehicle.userId,
      emailSent: dto.sendEmail ?? true,
    });

    // TODO: Send email notification if dto.sendEmail is true

    return validationLog;
  }
}
