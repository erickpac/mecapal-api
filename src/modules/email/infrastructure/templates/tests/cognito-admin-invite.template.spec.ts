import {
  cognitoAdminInviteSubject,
  cognitoAdminInviteTemplate,
} from '../cognito-admin-invite.template';

describe('cognitoAdminInviteTemplate', () => {
  it('returns the Spanish admin invite subject', () => {
    expect(cognitoAdminInviteSubject()).toBe('Tu acceso al panel de Mekapal');
  });

  it('embeds the username and temporary password placeholders', () => {
    const html = cognitoAdminInviteTemplate();
    expect(html).toContain('{username}');
    expect(html).toContain('{####}');
    expect(html).toContain('Mekapal');
  });
});
