import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CognitoService } from './cognito.service';
import { ForgotPasswordRateLimitedException } from '../../domain/exceptions/cognito.exceptions';

describe('CognitoService.forgotPassword', () => {
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
    // Replace the AWS SDK client's send with our mock
    (service as unknown as { client: { send: jest.Mock } }).client = {
      send: sendMock,
    };

    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeAwsError = (name: string) => {
    const err = new Error(`${name} message`) as Error & {
      name: string;
      $metadata: { requestId: string };
    };
    err.name = name;
    err.$metadata = { requestId: 'req-123' };
    return err;
  };

  it('resolves without error on happy path', async () => {
    sendMock.mockResolvedValue({});

    await expect(
      service.forgotPassword('user@example.com'),
    ).resolves.toBeUndefined();
  });

  it.each([
    'UserNotFoundException',
    'InvalidParameterException',
    'NotAuthorizedException',
    'CodeDeliveryFailureException',
  ])('silently absorbs %s', async (name) => {
    sendMock.mockRejectedValue(makeAwsError(name));

    await expect(
      service.forgotPassword('user@example.com'),
    ).resolves.toBeUndefined();
  });

  it.each(['LimitExceededException', 'TooManyRequestsException'])(
    'translates %s into ForgotPasswordRateLimitedException',
    async (name) => {
      sendMock.mockRejectedValue(makeAwsError(name));

      await expect(
        service.forgotPassword('user@example.com'),
      ).rejects.toBeInstanceOf(ForgotPasswordRateLimitedException);
    },
  );

  it('rethrows unexpected errors unchanged', async () => {
    const err = makeAwsError('InternalErrorException');
    sendMock.mockRejectedValue(err);

    await expect(service.forgotPassword('user@example.com')).rejects.toBe(err);
  });
});
