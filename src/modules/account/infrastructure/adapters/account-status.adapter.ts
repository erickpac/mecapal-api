import { Inject, Injectable, Logger } from '@nestjs/common';
import { IAccountStatusPort } from '../../../cognito/domain/interfaces/IAccountStatusPort';
import { ACCOUNT_TOKENS } from '../../domain/constants/injection-tokens';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';

@Injectable()
export class AccountStatusAdapter implements IAccountStatusPort {
  private readonly logger = new Logger(AccountStatusAdapter.name);

  constructor(
    @Inject(ACCOUNT_TOKENS.IAccountDeletionRepository)
    private readonly repository: IAccountDeletionRepository,
  ) {}

  async cancelPendingDeletionIfAny(userId: string): Promise<void> {
    const scheduled = await this.repository.getScheduledDeletion(userId);
    if (!scheduled) return;

    await this.repository.cancelDeletion(userId);
    this.logger.log(`Auto-canceled pending deletion on sign-in for ${userId}`);
  }
}
