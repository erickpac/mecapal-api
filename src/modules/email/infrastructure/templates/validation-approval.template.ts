import { baseTemplate } from './base.template';

export interface ValidationApprovalData {
  transporterName: string;
  entityType: 'vehicle' | 'profile';
  entitySummary?: string;
}

const entityTypeLabels: Record<string, string> = {
  vehicle: 'vehículo',
  profile: 'perfil de transportista',
};

export const validationApprovalTemplate = (
  data: ValidationApprovalData,
): string => {
  const entityLabel = entityTypeLabels[data.entityType] || data.entityType;

  const content = `
    <h2>Hola ${data.transporterName},</h2>

    <p>Nos complace informarte que tu ${entityLabel} ha sido <strong style="color: #16a34a;">aprobado</strong> exitosamente.</p>

    ${
      data.entitySummary
        ? `
    <div class="info-box">
      <strong>Detalles del ${entityLabel}:</strong>
      <p>${data.entitySummary}</p>
    </div>
    `
        : ''
    }

    <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center;">
      <p style="color: #16a34a; font-size: 18px; margin: 0;">
        &#10003; Tu ${entityLabel} está activo y listo para usar
      </p>
    </div>

    <h3>¿Qué sigue?</h3>
    <ul>
      <li>Ya puedes comenzar a recibir solicitudes de transporte</li>
      <li>Asegúrate de mantener tu información actualizada</li>
      <li>Revisa tu perfil para verificar que todos los datos estén correctos</li>
    </ul>

    <p>Gracias por ser parte de Mecapal.</p>

    <p>Saludos,<br>El equipo de Mecapal</p>
  `;

  return baseTemplate(content);
};

export const validationApprovalSubject = (
  data: ValidationApprovalData,
): string => {
  const entityLabel = entityTypeLabels[data.entityType] || data.entityType;
  return `Tu ${entityLabel} ha sido aprobado - Mecapal`;
};
