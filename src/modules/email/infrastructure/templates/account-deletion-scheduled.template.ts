import { baseTemplate } from './base.template';

export interface AccountDeletionScheduledData {
  userName: string;
  scheduledFor: string;
}

export const accountDeletionScheduledTemplate = (
  data: AccountDeletionScheduledData,
): string => {
  const content = `
    <h2>Hola ${data.userName},</h2>

    <p>Recibimos tu solicitud para eliminar tu cuenta de Mekapal.</p>

    <div class="info-box">
      <strong>Fecha de eliminación programada:</strong>
      <p>${data.scheduledFor}</p>
    </div>

    <p>Tienes 30 días para cancelar. Si vuelves a iniciar sesión antes de esa fecha, la eliminación se cancelará automáticamente y tu cuenta seguirá activa.</p>

    <p>Después de esa fecha, eliminaremos tu información personal de forma permanente. Los registros tributarios y transaccionales se conservarán anonimizados según las obligaciones legales.</p>

    <p>Si no solicitaste esta acción, inicia sesión ahora para cancelarla.</p>

    <p>Saludos,<br>El equipo de Mekapal</p>
  `;

  return baseTemplate(content);
};

export const accountDeletionScheduledSubject = (): string =>
  'Eliminación de cuenta programada - Mekapal';
