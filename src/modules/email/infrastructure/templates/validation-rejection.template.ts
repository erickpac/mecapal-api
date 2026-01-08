import { baseTemplate } from './base.template';

export interface ValidationRejectionData {
  transporterName: string;
  entityType: 'vehicle' | 'profile';
  rejectionCategory: string;
  rejectionDetails?: string;
  entitySummary?: string;
}

const categoryLabels: Record<string, string> = {
  POOR_QUALITY_PHOTOS: 'Fotos de baja calidad',
  EXPIRED_DOCUMENTS: 'Documentos vencidos',
  INFORMATION_MISMATCH: 'Inconsistencia en la información',
  ADDITIONAL_DOCUMENTATION_REQUIRED: 'Documentación adicional requerida',
  OTHER: 'Otro motivo',
};

const entityTypeLabels: Record<string, string> = {
  vehicle: 'vehículo',
  profile: 'perfil de transportista',
};

export const validationRejectionTemplate = (
  data: ValidationRejectionData,
): string => {
  const categoryLabel =
    categoryLabels[data.rejectionCategory] || data.rejectionCategory;
  const entityLabel = entityTypeLabels[data.entityType] || data.entityType;

  const content = `
    <h2>Hola ${data.transporterName},</h2>

    <p>Lamentamos informarte que tu solicitud de validación de ${entityLabel} no ha sido aprobada.</p>

    <div class="alert">
      <div class="alert-title">Motivo del rechazo</div>
      <p><strong>${categoryLabel}</strong></p>
      ${data.rejectionDetails ? `<p>${data.rejectionDetails}</p>` : ''}
    </div>

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

    <h3>¿Qué puedes hacer?</h3>
    <ul>
      <li>Revisa la información proporcionada y asegúrate de que sea correcta</li>
      <li>Sube documentos o fotos de mejor calidad si es necesario</li>
      <li>Verifica que todos los documentos estén vigentes</li>
      <li>Una vez corregido, puedes volver a enviar tu solicitud</li>
    </ul>

    <p>Si tienes alguna duda, no dudes en contactarnos.</p>

    <p>Saludos,<br>El equipo de Mecapal</p>
  `;

  return baseTemplate(content);
};

export const validationRejectionSubject = (
  data: ValidationRejectionData,
): string => {
  const entityLabel = entityTypeLabels[data.entityType] || data.entityType;
  return `Tu ${entityLabel} requiere correcciones - Mecapal`;
};
