import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ACCOUNT_TOKENS } from '../../domain/constants/injection-tokens';
import { COGNITO_TOKENS } from '../../../cognito/domain/constants/injection-tokens';
import { EMAIL_TOKENS } from '../../../email/domain/constants/injection-tokens';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IEmailService } from '../../../email/domain/interfaces/email-service.interface';
import { EmailTemplate } from '../../../email/domain/types/email.types';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { IAccountDeletionBlockerService } from '../../domain/interfaces/account-deletion-blocker-service.interface';
import {
  AccountAlreadyScheduledForDeletionException,
  AccountDeletionBlockedException,
} from '../../domain/exceptions/account-deletion.exceptions';
import { RequestAccountDeletionDto } from '../dtos/request-account-deletion.dto';

export const DELETION_GRACE_PERIOD_DAYS = 30;

export interface RequestAccountDeletionInput {
  userId: string;
  email: string;
  firstName: string;
  dto: RequestAccountDeletionDto;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RequestAccountDeletionUseCase {
  private readonly logger = new Logger(RequestAccountDeletionUseCase.name);

  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(ACCOUNT_TOKENS.IAccountDeletionRepository)
    private readonly repository: IAccountDeletionRepository,
    @Inject(ACCOUNT_TOKENS.IAccountDeletionBlockerService)
    private readonly blockerService: IAccountDeletionBlockerService,
    @Inject(EMAIL_TOKENS.IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    input: RequestAccountDeletionInput,
  ): Promise<{ scheduledFor: Date; message: string }> {
    const existing = await this.repository.getScheduledDeletion(input.userId);
    if (existing) {
      throw new AccountAlreadyScheduledForDeletionException(existing);
    }

    const passwordOk = await this.cognitoService.verifyPassword(
      input.email,
      input.dto.password,
    );
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid password');
    }

    const blockers = await this.blockerService.findBlockers(input.userId);
    if (blockers.length > 0) {
      throw new AccountDeletionBlockedException(blockers);
    }

    const scheduledFor = new Date(
      Date.now() + DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.repository.scheduleDeletion({
      userId: input.userId,
      scheduledFor,
      reason: input.dto.reason,
      otherReason: input.dto.otherReason,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    this.emailService
      .sendTemplated({
        to: input.email,
        template: EmailTemplate.ACCOUNT_DELETION_SCHEDULED,
        data: {
          userName: input.firstName,
          scheduledFor: scheduledFor.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
      })
      .catch((err) => {
        this.logger.warn(
          `Failed to send deletion-scheduled email to user ${input.userId}: ${
            err instanceof Error ? err.message : 'unknown'
          }`,
        );
      });

    return {
      scheduledFor,
      message: `Account deletion scheduled. You have ${DELETION_GRACE_PERIOD_DAYS} days to cancel by signing in again.`,
    };
  }
}
