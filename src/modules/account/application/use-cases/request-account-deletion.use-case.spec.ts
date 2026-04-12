/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import {
  DELETION_GRACE_PERIOD_DAYS,
  RequestAccountDeletionUseCase,
} from './request-account-deletion.use-case';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { IAccountDeletionBlockerService } from '../../domain/interfaces/account-deletion-blocker-service.interface';
import { AccountAlreadyScheduledForDeletionException } from '../../domain/exceptions/account-deletion.exceptions';

describe('RequestAccountDeletionUseCase', () => {
  let useCase: RequestAccountDeletionUseCase;
  let cognito: jest.Mocked<Pick<ICognitoService, 'verifyPassword'>>;
  let repo: jest.Mocked<IAccountDeletionRepository>;
  let blocker: jest.Mocked<IAccountDeletionBlockerService>;

  const baseInput = {
    userId: 'user-1',
    email: 'user@example.com',
    dto: { password: 'pw' },
  };

  beforeEach(() => {
    cognito = { verifyPassword: jest.fn() };
    repo = {
      scheduleDeletion: jest.fn(),
      cancelDeletion: jest.fn(),
      getScheduledDeletion: jest.fn(),
    };
    blocker = { findBlockers: jest.fn() };
    useCase = new RequestAccountDeletionUseCase(
      cognito as unknown as ICognitoService,
      repo,
      blocker,
    );
  });

  it('schedules deletion for 30 days ahead on happy path', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);
    cognito.verifyPassword.mockResolvedValue(true);
    blocker.findBlockers.mockResolvedValue([]);
    repo.scheduleDeletion.mockResolvedValue({ scheduledFor: new Date() });

    const result = await useCase.execute(baseInput);

    expect(repo.scheduleDeletion).toHaveBeenCalledTimes(1);
    const expectedMs = DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    expect(result.scheduledFor.getTime() - Date.now()).toBeGreaterThan(
      expectedMs - 5000,
    );
    expect(result.scheduledFor.getTime() - Date.now()).toBeLessThanOrEqual(
      expectedMs + 1000,
    );
  });

  it('throws if deletion already scheduled', async () => {
    repo.getScheduledDeletion.mockResolvedValue(new Date());

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      AccountAlreadyScheduledForDeletionException,
    );
    expect(cognito.verifyPassword).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException on wrong password', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);
    cognito.verifyPassword.mockResolvedValue(false);

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(repo.scheduleDeletion).not.toHaveBeenCalled();
  });

  it('throws AccountDeletionBlockedException when blockers exist', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);
    cognito.verifyPassword.mockResolvedValue(true);
    blocker.findBlockers.mockResolvedValue([
      'ACTIVE_ORDERS',
      'PENDING_SETTLEMENTS',
    ]);

    await expect(useCase.execute(baseInput)).rejects.toMatchObject({
      name: 'AccountDeletionBlockedException',
      blockers: ['ACTIVE_ORDERS', 'PENDING_SETTLEMENTS'],
    });
    expect(repo.scheduleDeletion).not.toHaveBeenCalled();
  });
});
