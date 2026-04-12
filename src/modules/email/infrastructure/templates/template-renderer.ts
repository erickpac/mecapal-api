import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../../domain/types/email.types';
import {
  validationApprovalTemplate,
  validationApprovalSubject,
  ValidationApprovalData,
} from './validation-approval.template';
import {
  validationRejectionTemplate,
  validationRejectionSubject,
  ValidationRejectionData,
} from './validation-rejection.template';
import {
  accountDeletionScheduledTemplate,
  accountDeletionScheduledSubject,
  AccountDeletionScheduledData,
} from './account-deletion-scheduled.template';
import {
  accountDeletionCompletedTemplate,
  accountDeletionCompletedSubject,
  AccountDeletionCompletedData,
} from './account-deletion-completed.template';
import { baseTemplate } from './base.template';

type TemplateData =
  | ValidationApprovalData
  | ValidationRejectionData
  | AccountDeletionScheduledData
  | AccountDeletionCompletedData
  | Record<string, unknown>;

@Injectable()
export class TemplateRenderer {
  private templates: Record<EmailTemplate, (data: TemplateData) => string> = {
    [EmailTemplate.VALIDATION_APPROVAL]: (data) =>
      validationApprovalTemplate(data as ValidationApprovalData),
    [EmailTemplate.VALIDATION_REJECTION]: (data) =>
      validationRejectionTemplate(data as ValidationRejectionData),
    [EmailTemplate.WELCOME]: (data) =>
      this.renderWelcome(data as Record<string, unknown>),
    [EmailTemplate.ACCOUNT_DELETION_SCHEDULED]: (data) =>
      accountDeletionScheduledTemplate(data as AccountDeletionScheduledData),
    [EmailTemplate.ACCOUNT_DELETION_COMPLETED]: (data) =>
      accountDeletionCompletedTemplate(data as AccountDeletionCompletedData),
  };

  private subjects: Record<EmailTemplate, (data: TemplateData) => string> = {
    [EmailTemplate.VALIDATION_APPROVAL]: (data) =>
      validationApprovalSubject(data as ValidationApprovalData),
    [EmailTemplate.VALIDATION_REJECTION]: (data) =>
      validationRejectionSubject(data as ValidationRejectionData),
    [EmailTemplate.WELCOME]: () => 'Bienvenido a Mekapal',
    [EmailTemplate.ACCOUNT_DELETION_SCHEDULED]: () =>
      accountDeletionScheduledSubject(),
    [EmailTemplate.ACCOUNT_DELETION_COMPLETED]: () =>
      accountDeletionCompletedSubject(),
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
      <h2>Bienvenido a Mekapal, ${name}!</h2>
      <p>Gracias por unirte a nuestra plataforma de logística.</p>
      <p>Estamos emocionados de tenerte con nosotros.</p>
    `;
    return baseTemplate(content);
  }
}
