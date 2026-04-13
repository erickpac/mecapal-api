import { Logger } from '@nestjs/common';
import { ProcessScheduledDeletionsUseCase } from './process-scheduled-deletions.use-case';
import { IAccountDeletionRepository } from '../../domain/interfaces/account-deletion-repository.interface';
import { ICognitoService } from '../../../cognito/domain/interfaces/ICognitoService';
import { IEmailService } from '../../../email/domain/interfaces/email-service.interface';
import { IS3Service } from '../../../upload/infrastructure/services/s3.service.interface';

describe('ProcessScheduledDeletionsUseCase', () => {
  let useCase: ProcessScheduledDeletionsUseCase;
  let repo: jest.Mocked<IAccountDeletionRepository>;
  let cognito: jest.Mocked<Pick<ICognitoService, 'adminDeleteUser'>>;
  let email: jest.Mocked<Pick<IEmailService, 'sendTemplated'>>;
  let s3: jest.Mocked<Pick<IS3Service, 'deleteObjects' | 'extractKeyFromUrl'>>;

  beforeEach(() => {
    repo = {
      scheduleDeletion: jest.fn(),
      cancelDeletion: jest.fn(),
      getScheduledDeletion: jest.fn(),
      findDueDeletions: jest.fn(),
      finalizeDeletion: jest.fn(),
      collectPiiUrls: jest.fn().mockResolvedValue([]),
    };
    cognito = { adminDeleteUser: jest.fn() };
    email = {
      sendTemplated: jest
        .fn()
        .mockResolvedValue({ messageId: 'm', success: true }),
    };
    s3 = {
      deleteObjects: jest.fn().mockResolvedValue(undefined),
      extractKeyFromUrl: jest.fn((url: string) => {
        const m = /https:\/\/[^/]+\/(.+)/.exec(url);
        return m ? m[1] : null;
      }),
    };
    useCase = new ProcessScheduledDeletionsUseCase(
      repo,
      cognito as unknown as ICognitoService,
      email as unknown as IEmailService,
      s3 as unknown as IS3Service,
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

  it('deletes PII S3 objects before finalizing', async () => {
    repo.findDueDeletions.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.com',
        firstName: 'A',
        lastName: 'L',
        cognitoSub: 's1',
      },
    ]);
    repo.collectPiiUrls.mockResolvedValue([
      'https://bucket.s3.us-east-1.amazonaws.com/licenses/abc.jpg',
      'https://bucket.s3.us-east-1.amazonaws.com/vehicles/xyz.png',
    ]);

    await useCase.execute();

    expect(s3.deleteObjects).toHaveBeenCalledWith([
      'licenses/abc.jpg',
      'vehicles/xyz.png',
    ]);
    expect(repo.finalizeDeletion).toHaveBeenCalledWith('u1');
  });

  it('still finalizes when S3 cleanup fails', async () => {
    repo.findDueDeletions.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@x.com',
        firstName: 'A',
        lastName: 'L',
        cognitoSub: 's1',
      },
    ]);
    repo.collectPiiUrls.mockResolvedValue([
      'https://bucket.s3.us-east-1.amazonaws.com/licenses/abc.jpg',
    ]);
    s3.deleteObjects.mockRejectedValue(new Error('S3 down'));

    const result = await useCase.execute();

    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(repo.finalizeDeletion).toHaveBeenCalledWith('u1');
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
