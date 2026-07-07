import { baseTemplate } from './base.template';

export const cognitoAdminInviteSubject = (): string =>
  'Tu acceso al panel de Mekapal';

export const cognitoAdminInviteTemplate = (): string => {
  const content = `
    <h2>Bienvenido a Mekapal</h2>
    <p>Se creó una cuenta para ti en el panel administrativo de Mekapal.</p>
    <div class="info-box">
      <p><strong>Usuario:</strong> {username}</p>
      <p><strong>Contraseña temporal:</strong> {####}</p>
    </div>
    <p>Inicia sesión y cambia tu contraseña en el primer acceso.</p>
  `;
  return baseTemplate(content);
};
