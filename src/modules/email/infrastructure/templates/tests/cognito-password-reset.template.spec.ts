import {
  cognitoPasswordResetSubject,
  cognitoPasswordResetTemplate,
} from '../cognito-password-reset.template';

describe('cognitoPasswordResetTemplate', () => {
  it('returns the Spanish password reset subject', () => {
    expect(cognitoPasswordResetSubject()).toBe(
      'Restablece tu contraseña de Mekapal',
    );
  });

  it('embeds the Cognito code placeholder and Mekapal branding', () => {
    const html = cognitoPasswordResetTemplate();
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
