export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface TemplatedEmailOptions {
  to: string | string[];
  template: EmailTemplate;
  data: Record<string, unknown>;
  replyTo?: string;
}

export interface BulkEmailOptions {
  recipients: BulkRecipient[];
  template: EmailTemplate;
  defaultData?: Record<string, unknown>;
}

export interface BulkRecipient {
  email: string;
  data: Record<string, unknown>;
}

export interface EmailResult {
  messageId: string;
  success: boolean;
  error?: string;
}

export enum EmailTemplate {
  VALIDATION_APPROVAL = 'validation-approval',
  VALIDATION_REJECTION = 'validation-rejection',
  WELCOME = 'welcome',
  ACCOUNT_DELETION_SCHEDULED = 'account-deletion-scheduled',
  ACCOUNT_DELETION_COMPLETED = 'account-deletion-completed',
}
