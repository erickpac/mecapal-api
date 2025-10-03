import { Injectable } from '@nestjs/common';
import { ResendService } from '../../../resend/resend.service';
import { IEmailService } from '../../domain/services/email.service.interface';

/**
 * Resend Email Service
 * Implements email operations using Resend service
 */
@Injectable()
export class ResendEmailService implements IEmailService {
  constructor(private readonly resendService: ResendService) {}

  async sendPasswordRecovery(
    email: string,
    name: string,
    newPassword: string,
  ): Promise<void> {
    await this.resendService.sendEmail(
      email,
      'Recuperación de Contraseña',
      `Hola ${name}, <br>tu nueva contraseña es: ${newPassword}`,
    );
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.resendService.sendEmail(
      email,
      'Bienvenido a Mecapal',
      `Hola ${name}, <br>Bienvenido a Mecapal. Tu cuenta ha sido creada exitosamente.`,
    );
  }
}
