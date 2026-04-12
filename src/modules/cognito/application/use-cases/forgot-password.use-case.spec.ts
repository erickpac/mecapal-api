import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { ForgotPasswordRateLimitedException } from '../../domain/exceptions/cognito.exceptions';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let cognitoService: jest.Mocked<Pick<ICognitoService, 'forgotPassword'>>;

  beforeEach(() => {
    cognitoService = { forgotPassword: jest.fn() };
    useCase = new ForgotPasswordUseCase(
      cognitoService as unknown as ICognitoService,
    );
  });

  it('returns generic message on success', async () => {
    cognitoService.forgotPassword.mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'user@example.com' });

    expect(result).toEqual({
      message: 'If the email exists, a verification code has been sent.',
    });
  });

  it('returns generic message when service silently absorbs error', async () => {
    cognitoService.forgotPassword.mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'missing@example.com' });

    expect(result.message).toMatch(/If the email exists/);
  });

  it('propagates ForgotPasswordRateLimitedException', async () => {
    cognitoService.forgotPassword.mockRejectedValue(
      new ForgotPasswordRateLimitedException(),
    );

    await expect(
      useCase.execute({ email: 'user@example.com' }),
    ).rejects.toBeInstanceOf(ForgotPasswordRateLimitedException);
  });

  it('propagates unexpected errors as-is', async () => {
    const unexpected = new Error('boom');
    cognitoService.forgotPassword.mockRejectedValue(unexpected);

    await expect(useCase.execute({ email: 'user@example.com' })).rejects.toBe(
      unexpected,
    );
  });
});
