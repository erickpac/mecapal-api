import {
  EmailOptions,
  TemplatedEmailOptions,
  BulkEmailOptions,
  EmailResult,
} from '../types/email.types';

export interface IEmailService {
  send(options: EmailOptions): Promise<EmailResult>;
  sendTemplated(options: TemplatedEmailOptions): Promise<EmailResult>;
  sendBulk(options: BulkEmailOptions): Promise<EmailResult[]>;
}
