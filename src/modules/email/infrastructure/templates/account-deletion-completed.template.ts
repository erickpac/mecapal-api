import { baseTemplate } from './base.template';

export interface AccountDeletionCompletedData {
  userName: string;
}

export const accountDeletionCompletedTemplate = (
  data: AccountDeletionCompletedData,
): string => {
  const content = `
    <h2>Hola ${data.userName},</h2>

    <p>Tu cuenta de Mekapal ha sido eliminada.</p>

    <p>Eliminamos tu información personal (nombre, teléfono, email) de forma permanente. Los registros tributarios y transaccionales se conservan anonimizados según la legislación aplicable.</p>

    <p>Gracias por haber sido parte de Mekapal. Si en el futuro quieres volver, podrás crear una cuenta nueva sin problema.</p>

    <p>Saludos,<br>El equipo de Mekapal</p>
  `;

  return baseTemplate(content);
};

export const accountDeletionCompletedSubject = (): string =>
  'Tu cuenta ha sido eliminada - Mekapal';
