/* eslint-disable @typescript-eslint/unbound-method */
import { Logger } from '@nestjs/common';
import { ProcessScheduledDeletionsUseCase } from './process-scheduled-deletions.use-case';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IEmailService } from '../../../email/domain/interfaces/email-service.interface';

describe('ProcessScheduledDeletionsUseCase', () => {
  let useCase: ProcessScheduledDeletionsUseCase;
  let repo: jest.Mocked<IAccountDeletionRepository>;
  let cognito: jest.Mocked<Pick<ICognitoService, 'adminDeleteUser'>>;
  let email: jest.Mocked<Pick<IEmailService, 'sendTemplated'>>;

  beforeEach(() => {
    repo = {
      scheduleDeletion: jest.fn(),
      cancelDeletion: jest.fn(),
      getScheduledDeletion: jest.fn(),
      findDueDeletions: jest.fn(),
      finalizeDeletion: jest.fn(),
    };
    cognito = { adminDeleteUser: jest.fn() };
    email = {
      sendTemplated: jest
        .fn()
        .mockResolvedValue({ messageId: 'm', success: true }),
    };
    useCase = new ProcessScheduledDeletionsUseCase(
      repo,
      cognito as unknown as ICognitoService,
      email as unknown as IEmailService,
    );
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => jest.clearAllMocks());

  it('returns zero counts when no due deletions', async () => {
    repo.findDueDeletions.mockResolvedValue([]);
    const result = await useCase.execute();
    expect(result).toEqual({ processed: 0, failed: 0 });
    expect(cognito.adminDeleteUser).not.toHaveBeenCalled();
  });

  it('processes due users: email, cognito delete, finalize', async () => {
    repo.findDueDeletions.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.com',
        firstName: 'A',
        lastName: 'L',
        cognitoSub: 's1',
      },
      {
        id: 'u2',
        email: 'b@x.com',
        firstName: 'B',
        lastName: 'L',
        cognitoSub: 's2',
      },
    ]);
    cognito.adminDeleteUser.mockResolvedValue(undefined);
    repo.finalizeDeletion.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 2, failed: 0 });
    expect(email.sendTemplated).toHaveBeenCalledTimes(2);
    expect(cognito.adminDeleteUser).toHaveBeenCalledWith('a@x.com');
    expect(cognito.adminDeleteUser).toHaveBeenCalledWith('b@x.com');
    expect(repo.finalizeDeletion).toHaveBeenCalledWith('u1');
    expect(repo.finalizeDeletion).toHaveBeenCalledWith('u2');
  });

  it('counts failures when Cognito delete throws, continues with the rest', async () => {
    repo.findDueDeletions.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.com',
        firstName: 'A',
        lastName: 'L',
        cognitoSub: 's1',
      },
      {
        id: 'u2',
        email: 'b@x.com',
        firstName: 'B',
        lastName: 'L',
        cognitoSub: 's2',
      },
    ]);
    cognito.adminDeleteUser
      .mockRejectedValueOnce(new Error('cognito down'))
      .mockResolvedValueOnce(undefined);
    repo.finalizeDeletion.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 1 });
    expect(repo.finalizeDeletion).toHaveBeenCalledTimes(1);
    expect(repo.finalizeDeletion).toHaveBeenCalledWith('u2');
  });

  it('proceeds with deletion even if email fails', async () => {
    repo.findDueDeletions.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.com',
        firstName: 'A',
        lastName: 'L',
        cognitoSub: 's1',
      },
    ]);
    email.sendTemplated.mockRejectedValue(new Error('SES down'));
    cognito.adminDeleteUser.mockResolvedValue(undefined);
    repo.finalizeDeletion.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(cognito.adminDeleteUser).toHaveBeenCalled();
    expect(repo.finalizeDeletion).toHaveBeenCalled();
  });
});
