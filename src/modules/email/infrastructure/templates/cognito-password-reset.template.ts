import { baseTemplate } from './base.template';

export const cognitoPasswordResetSubject = (): string =>
  'Restablece tu contraseña de Mekapal';

export const cognitoPasswordResetTemplate = (): string => {
  const content = `
    <h2>Restablece tu contraseña</h2>
    <p>Recibimos una solicitud para restablecer tu contraseña. Usa este código:</p>
    <div class="info-box" style="text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
      {####}
    </div>
    <p>Si no solicitaste este cambio, ignora este correo; tu contraseña seguirá igual.</p>
  `;
  return baseTemplate(content);
};
