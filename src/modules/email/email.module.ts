import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EMAIL_TOKENS } from './domain/constants/injection-tokens';
import { SesEmailService } from './infrastructure/services/ses-email.service';
import { TemplateRenderer } from './infrastructure/templates/template-renderer';
import { SendValidationRejectionEmailUseCase } from './application/use-cases/send-validation-rejection-email.use-case';

@Module({
  imports: [ConfigModule],
  providers: [
    TemplateRenderer,
    {
      provide: EMAIL_TOKENS.IEmailService,
      useClass: SesEmailService,
    },
    SendValidationRejectionEmailUseCase,
  ],
  exports: [EMAIL_TOKENS.IEmailService, SendValidationRejectionEmailUseCase],
})
export class EmailModule {}
