import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_DELETION_GRACE_PERIOD_DAYS,
  RequestAccountDeletionUseCase,
} from './request-account-deletion.use-case';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IEmailService } from '../../../email/domain/interfaces/email-service.interface';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { IAccountDeletionBlockerService } from '../../domain/interfaces/account-deletion-blocker-service.interface';
import { AccountAlreadyScheduledForDeletionException } from '../../domain/exceptions/account-deletion.exceptions';

describe('RequestAccountDeletionUseCase', () => {
  let useCase: RequestAccountDeletionUseCase;
  let cognito: jest.Mocked<Pick<ICognitoService, 'verifyPassword'>>;
  let repo: jest.Mocked<IAccountDeletionRepository>;
  let blocker: jest.Mocked<IAccountDeletionBlockerService>;
  let email: jest.Mocked<Pick<IEmailService, 'sendTemplated'>>;
  let config: jest.Mocked<Pick<ConfigService, 'get'>>;

  const baseInput = {
    userId: 'user-1',
    email: 'user@example.com',
    firstName: 'Alice',
    dto: { password: 'pw' },
  };

  beforeEach(() => {
    cognito = { verifyPassword: jest.fn() };
    repo = {
      scheduleDeletion: jest.fn(),
      cancelDeletion: jest.fn(),
      getScheduledDeletion: jest.fn(),
      findDueDeletions: jest.fn(),
      finalizeDeletion: jest.fn(),
      collectPiiUrls: jest.fn(),
    };
    blocker = { findBlockers: jest.fn() };
    email = {
      sendTemplated: jest
        .fn()
        .mockResolvedValue({ messageId: 'm', success: true }),
    };
    config = { get: jest.fn().mockReturnValue(undefined) };
    useCase = new RequestAccountDeletionUseCase(
      cognito as unknown as ICognitoService,
      repo,
      blocker,
      email as unknown as IEmailService,
      config as unknown as ConfigService,
    );
  });

  it('schedules deletion for 30 days ahead on happy path', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);
    cognito.verifyPassword.mockResolvedValue(true);
    blocker.findBlockers.mockResolvedValue([]);
    repo.scheduleDeletion.mockResolvedValue({ scheduledFor: new Date() });

    const result = await useCase.execute(baseInput);

    expect(repo.scheduleDeletion).toHaveBeenCalledTimes(1);
    const expectedMs = DEFAULT_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    expect(result.scheduledFor.getTime() - Date.now()).toBeGreaterThan(
      expectedMs - 5000,
    );
    expect(result.scheduledFor.getTime() - Date.now()).toBeLessThanOrEqual(
      expectedMs + 1000,
    );
  });

  it('uses DELETION_GRACE_PERIOD_DAYS env when present', async () => {
    repo.getScheduledDeletion.mockResolvedValue(null);
    cognito.verifyPassword.mockResolvedValue(true);
    blocker.findBlockers.mockResolvedValue([]);
    repo.scheduleDeletion.mockResolvedValue({ scheduledFor: new Date() });
    config.get.mockImplementation((key: string) =>
      key === 'DELETION_GRACE_PERIOD_DAYS' ? '7' : undefined,
    );

    const result = await useCase.execute(baseInput);

    const expectedMs = 7 * 24 * 60 * 60 * 1000;
    expect(result.scheduledFor.getTime() - Date.now()).toBeGreaterThan(
      expectedMs - 5000,
    );
    expect(result.scheduledFor.getTime() - Date.now()).toBeLessThanOrEqual(
      expectedMs + 1000,
    );
    expect(result.message).toContain('7 days');
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
