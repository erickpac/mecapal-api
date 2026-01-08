import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../../domain/types/email.types';
import {
  validationRejectionTemplate,
  validationRejectionSubject,
  ValidationRejectionData,
} from './validation-rejection.template';
import { baseTemplate } from './base.template';

type TemplateData = ValidationRejectionData | Record<string, unknown>;

@Injectable()
export class TemplateRenderer {
  private templates: Record<EmailTemplate, (data: TemplateData) => string> = {
    [EmailTemplate.VALIDATION_REJECTION]: (data) =>
      validationRejectionTemplate(data as ValidationRejectionData),
    [EmailTemplate.WELCOME]: (data) =>
      this.renderWelcome(data as Record<string, unknown>),
  };

  private subjects: Record<EmailTemplate, (data: TemplateData) => string> = {
    [EmailTemplate.VALIDATION_REJECTION]: (data) =>
      validationRejectionSubject(data as ValidationRejectionData),
    [EmailTemplate.WELCOME]: () => 'Bienvenido a Mecapal',
  };

  render(template: EmailTemplate, data: Record<string, unknown>): string {
    const templateFn = this.templates[template];
    if (!templateFn) {
      throw new Error(`Template ${template} not found`);
    }
    return templateFn(data);
  }

  getSubject(template: EmailTemplate, data: Record<string, unknown>): string {
    const subjectFn = this.subjects[template];
    return subjectFn ? subjectFn(data) : '';
  }

  private renderWelcome(data: Record<string, unknown>): string {
    const name = (data.name as string) || 'Usuario';
    const content = `
      <h2>Bienvenido a Mecapal, ${name}!</h2>
      <p>Gracias por unirte a nuestra plataforma de logística.</p>
      <p>Estamos emocionados de tenerte con nosotros.</p>
    `;
    return baseTemplate(content);
  }
}
