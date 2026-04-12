import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ACCOUNT_TOKENS } from '../../domain/constants/injection-tokens';
import { COGNITO_TOKENS } from '../../../cognito/domain/constants/injection-tokens';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
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
  dto: RequestAccountDeletionDto;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RequestAccountDeletionUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(ACCOUNT_TOKENS.IAccountDeletionRepository)
    private readonly repository: IAccountDeletionRepository,
    @Inject(ACCOUNT_TOKENS.IAccountDeletionBlockerService)
    private readonly blockerService: IAccountDeletionBlockerService,
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

    return {
      scheduledFor,
      message: `Account deletion scheduled. You have ${DELETION_GRACE_PERIOD_DAYS} days to cancel by signing in again.`,
    };
  }
}
