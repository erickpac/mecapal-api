import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;
  private readonly from: string = 'onboarding@resend.dev';

  constructor(private readonly configService: ConfigService) {
    const resendApiKey = configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(resendApiKey);
  }

  async sendEmail(to: string, subject: string, html: string) {
    this.logger.log(`Resend: sending email to: ${to} with subject: ${subject}`);

    return await this.resend.emails.send({
      from: this.from,
      to: to,
      subject: subject,
      html: html,
    });
  }
}
