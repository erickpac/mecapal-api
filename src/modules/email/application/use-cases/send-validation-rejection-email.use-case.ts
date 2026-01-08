import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_TOKENS } from '../../domain/constants/injection-tokens';
import { IEmailService } from '../../domain/interfaces/email-service.interface';
import { EmailTemplate, EmailResult } from '../../domain/types/email.types';
import { SendValidationRejectionEmailDto } from '../dtos/send-validation-rejection-email.dto';

@Injectable()
export class SendValidationRejectionEmailUseCase {
  constructor(
    @Inject(EMAIL_TOKENS.IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: SendValidationRejectionEmailDto): Promise<EmailResult> {
    return this.emailService.sendTemplated({
      to: dto.transporterEmail,
      template: EmailTemplate.VALIDATION_REJECTION,
      data: {
        transporterName: dto.transporterName,
        entityType: dto.entityType,
        rejectionCategory: dto.rejectionCategory,
        rejectionDetails: dto.rejectionDetails,
        entitySummary: dto.entitySummary,
      },
    });
  }
}
