import type { CustomMessageTriggerEvent } from 'aws-lambda';
import { handler } from './handler';

const buildEvent = (
  triggerSource: CustomMessageTriggerEvent['triggerSource'],
): CustomMessageTriggerEvent =>
  ({
    version: '1',
    region: 'us-east-1',
    userPoolId: 'us-east-1_test',
    userName: 'test-user',
    triggerSource,
    callerContext: { awsSdkVersion: '1', clientId: 'client' },
    request: {
      userAttributes: { email: 'test@example.com' },
      codeParameter: '{####}',
      usernameParameter: '{username}',
      linkParameter: '{##Click Here##}',
      clientMetadata: {},
    },
    response: { smsMessage: '', emailMessage: '', emailSubject: '' },
  }) as unknown as CustomMessageTriggerEvent;

describe('cognito custom message handler', () => {
  it('sets the Spanish verification email on sign-up', async () => {
    const result = await handler(buildEvent('CustomMessage_SignUp'));
    expect(result.response.emailSubject).toBe('Verifica tu cuenta en Mekapal');
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('reuses the verification email on resend', async () => {
    const result = await handler(buildEvent('CustomMessage_ResendCode'));
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('sets the password reset email on forgot password', async () => {
    const result = await handler(buildEvent('CustomMessage_ForgotPassword'));
    expect(result.response.emailSubject).toBe(
      'Restablece tu contraseña de Mekapal',
    );
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('sets the admin invite email with username and temp password', async () => {
    const result = await handler(buildEvent('CustomMessage_AdminCreateUser'));
    expect(result.response.emailMessage).toContain('{username}');
    expect(result.response.emailMessage).toContain('{####}');
  });

  it('leaves the response untouched for unhandled triggers', async () => {
    const event = buildEvent('CustomMessage_Authentication');
    const result = await handler(event);
    expect(result.response.emailMessage).toBe('');
    expect(result.response.emailSubject).toBe('');
  });
});
