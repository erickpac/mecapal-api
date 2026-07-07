import { baseTemplate } from './base.template';

export const cognitoVerificationSubject = (): string =>
  'Verifica tu cuenta en Mekapal';

export const cognitoVerificationTemplate = (): string => {
  const content = `
    <h2>Verifica tu cuenta</h2>
    <p>Usa este código para completar tu registro en Mekapal:</p>
    <div class="info-box" style="text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px;">
      {####}
    </div>
    <p>El código vence en unos minutos. Si no creaste una cuenta, ignora este correo.</p>
  `;
  return baseTemplate(content);
};
