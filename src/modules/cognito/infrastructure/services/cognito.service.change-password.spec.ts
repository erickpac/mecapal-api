import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CognitoService } from './cognito.service';
import {
  CognitoRateLimitedException,
  InvalidCredentialsException,
  InvalidPasswordException,
} from '../../domain/exceptions/cognito.exceptions';

describe('CognitoService.changePassword', () => {
  let service: CognitoService;
  let sendMock: jest.Mock;

  beforeEach(async () => {
    const configValues: Record<string, string> = {
      AWS_REGION: 'us-east-1',
      AWS_COGNITO_USER_POOL_ID: 'pool',
      AWS_COGNITO_CLIENT_ID: 'client',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => configValues[key],
            get: (key: string) => configValues[key],
          },
        },
      ],
    }).compile();

    service = module.get<CognitoService>(CognitoService);

    sendMock = jest.fn();
    (service as unknown as { client: { send: jest.Mock } }).client = {
      send: sendMock,
    };

    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeAwsError = (name: string, message = `${name} message`) => {
    const err = new Error(message) as Error & {
      name: string;
      $metadata: { requestId: string };
    };
    err.name = name;
    err.$metadata = { requestId: 'req-xyz' };
    return err;
  };

  it('resolves on happy path', async () => {
    sendMock.mockResolvedValue({});
    await expect(
      service.changePassword('token', 'Old123!', 'New456!'),
    ).resolves.toBeUndefined();
  });

  it.each(['LimitExceededException', 'TooManyRequestsException'])(
    'translates %s into CognitoRateLimitedException',
    async (name) => {
      sendMock.mockRejectedValue(makeAwsError(name));
      await expect(
        service.changePassword('token', 'Old123!', 'New456!'),
      ).rejects.toBeInstanceOf(CognitoRateLimitedException);
    },
  );

  it('maps NotAuthorizedException to InvalidCredentialsException', async () => {
    sendMock.mockRejectedValue(makeAwsError('NotAuthorizedException'));
    await expect(
      service.changePassword('token', 'WrongOld!', 'New456!'),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
  });

  it('maps InvalidPasswordException to InvalidPasswordException (domain)', async () => {
    sendMock.mockRejectedValue(
      makeAwsError('InvalidPasswordException', 'Password does not conform'),
    );
    await expect(
      service.changePassword('token', 'Old123!', 'weak'),
    ).rejects.toBeInstanceOf(InvalidPasswordException);
  });
});
