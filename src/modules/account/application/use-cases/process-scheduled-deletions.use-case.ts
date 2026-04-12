import { Inject, Injectable, Logger } from '@nestjs/common';
import { ACCOUNT_TOKENS } from '../../domain/constants/injection-tokens';
import { COGNITO_TOKENS } from '../../../cognito/domain/constants/injection-tokens';
import { EMAIL_TOKENS } from '../../../email/domain/constants/injection-tokens';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IEmailService } from '../../../email/domain/interfaces/email-service.interface';
import { EmailTemplate } from '../../../email/domain/types/email.types';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';

export interface ProcessScheduledDeletionsResult {
  processed: number;
  failed: number;
}

@Injectable()
export class ProcessScheduledDeletionsUseCase {
  private readonly logger = new Logger(ProcessScheduledDeletionsUseCase.name);

  constructor(
    @Inject(ACCOUNT_TOKENS.IAccountDeletionRepository)
    private readonly repository: IAccountDeletionRepository,
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(EMAIL_TOKENS.IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(): Promise<ProcessScheduledDeletionsResult> {
    const due = await this.repository.findDueDeletions(new Date());

    if (due.length === 0) {
      return { processed: 0, failed: 0 };
    }

    this.logger.log(`Processing ${due.length} scheduled deletion(s)`);

    let processed = 0;
    let failed = 0;

    for (const user of due) {
      try {
        await this.emailService
          .sendTemplated({
            to: user.email,
            template: EmailTemplate.ACCOUNT_DELETION_COMPLETED,
            data: { userName: user.firstName },
          })
          .catch((err) => {
            this.logger.warn(
              `Failed to send deletion-completed email to user ${user.id}: ${
                err instanceof Error ? err.message : 'unknown'
              }. Proceeding with deletion anyway.`,
            );
          });

        await this.cognitoService.adminDeleteUser(user.email);
        await this.repository.finalizeDeletion(user.id);
        processed += 1;
        this.logger.log(`Finalized deletion for user ${user.id}`);
      } catch (error) {
        failed += 1;
        this.logger.error(
          `Failed to finalize deletion for user ${user.id}: ${
            error instanceof Error ? error.message : 'unknown'
          }`,
        );
      }
    }

    return { processed, failed };
  }
}
