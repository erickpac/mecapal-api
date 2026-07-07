import {
  cognitoVerificationSubject,
  cognitoVerificationTemplate,
} from '../cognito-verification.template';

describe('cognitoVerificationTemplate', () => {
  it('returns the Spanish verification subject', () => {
    expect(cognitoVerificationSubject()).toBe('Verifica tu cuenta en Mekapal');
  });

  it('embeds the Cognito code placeholder and Mekapal branding', () => {
    const html = cognitoVerificationTemplate();
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
