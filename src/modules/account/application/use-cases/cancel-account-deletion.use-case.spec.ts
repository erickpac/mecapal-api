/* eslint-disable @typescript-eslint/unbound-method */
import { CancelAccountDeletionUseCase } from './cancel-account-deletion.use-case';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { AccountNotScheduledForDeletionException } from '../../domain/exceptions/account-deletion.exceptions';

describe('CancelAccountDeletionUseCase', () => {
  let useCase: CancelAccountDeletionUseCase;
  let repo: jest.Mocked<IAccountDeletionRepository>;

  beforeEach(() => {
    repo = {
      scheduleDeletion: jest.fn(),
      cancelDeletion: jest.fn(),
      getScheduledDeletion: jest.fn(),
      findDueDeletions: jest.fn(),
      finalizeDeletion: jest.fn(),
    };
    useCase = new CancelAccountDeletionUseCase(repo);
  });

  it('cancels when deletion is scheduled', async () => {
    repo.getScheduledDeletion.mockResolvedValue(new Date());

    const result = await useCase.execute('user-1');

    expect(repo.cancelDeletion).toHaveBeenCalledWith('user-1');
    expect(result.message).toMatch(/canceled/i);
  });

  it('throws when nothing scheduled', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);

    await expect(useCase.execute('user-1')).rejects.toBeInstanceOf(
      AccountNotScheduledForDeletionException,
    );
    expect(repo.cancelDeletion).not.toHaveBeenCalled();
  });
});
