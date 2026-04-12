import { Inject, Injectable } from '@nestjs/common';
import { ACCOUNT_TOKENS } from '../../domain/constants/injection-tokens';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { AccountNotScheduledForDeletionException } from '../../domain/exceptions/account-deletion.exceptions';

@Injectable()
export class CancelAccountDeletionUseCase {
  constructor(
    @Inject(ACCOUNT_TOKENS.IAccountDeletionRepository)
    private readonly repository: IAccountDeletionRepository,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    const scheduled = await this.repository.getScheduledDeletion(userId);
    if (!scheduled) {
      throw new AccountNotScheduledForDeletionException();
    }

    await this.repository.cancelDeletion(userId);

    return { message: 'Account deletion canceled.' };
  }
}
