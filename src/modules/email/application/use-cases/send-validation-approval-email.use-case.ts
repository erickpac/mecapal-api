import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_TOKENS } from '../../domain/constants/injection-tokens';
import { IEmailService } from '../../domain/interfaces/email-service.interface';
import { EmailTemplate, EmailResult } from '../../domain/types/email.types';
import { SendValidationApprovalEmailDto } from '../dtos/send-validation-approval-email.dto';

@Injectable()
export class SendValidationApprovalEmailUseCase {
  constructor(
    @Inject(EMAIL_TOKENS.IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(dto: SendValidationApprovalEmailDto): Promise<EmailResult> {
    return this.emailService.sendTemplated({
      to: dto.transporterEmail,
      template: EmailTemplate.VALIDATION_APPROVAL,
      data: {
        transporterName: dto.transporterName,
        entityType: dto.entityType,
        entitySummary: dto.entitySummary,
      },
    });
  }
}
