import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { IEmailService } from '../../domain/interfaces/email-service.interface';
import {
  EmailOptions,
  TemplatedEmailOptions,
  BulkEmailOptions,
  EmailResult,
} from '../../domain/types/email.types';
import { TemplateRenderer } from '../templates/template-renderer';

@Injectable()
export class SesEmailService implements IEmailService {
  private client: SESClient;
  private fromEmail: string;

  constructor(
    private configService: ConfigService,
    private templateRenderer: TemplateRenderer,
  ) {
    this.client = new SESClient({
      region: this.configService.get<string>('AWS_SES_REGION', 'us-east-1'),
    });
    this.fromEmail = this.configService.get<string>(
      'AWS_SES_FROM_EMAIL',
      'noreply@mecapal.com',
    );
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: {
        ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
        CcAddresses: options.cc,
        BccAddresses: options.bcc,
      },
      Message: {
        Subject: { Data: options.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: options.html, Charset: 'UTF-8' },
          Text: options.text ? { Data: options.text, Charset: 'UTF-8' } : undefined,
        },
      },
      ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
    });

    try {
      const response = await this.client.send(command);
      return { messageId: response.MessageId ?? '', success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { messageId: '', success: false, error: message };
    }
  }

  async sendTemplated(options: TemplatedEmailOptions): Promise<EmailResult> {
    const html = this.templateRenderer.render(options.template, options.data);
    const subject = this.templateRenderer.getSubject(
      options.template,
      options.data,
    );

    return this.send({
      to: options.to,
      subject,
      html,
      replyTo: options.replyTo,
    });
  }

  async sendBulk(options: BulkEmailOptions): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    const batches = this.chunk(options.recipients, 50);

    for (const batch of batches) {
      const promises = batch.map((recipient) =>
        this.sendTemplated({
          to: recipient.email,
          template: options.template,
          data: { ...options.defaultData, ...recipient.data },
        }),
      );

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  private chunk<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size),
    );
  }
}
