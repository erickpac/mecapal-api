import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { ResendService } from '../../../resend/resend.service';

@Injectable()
export class RecoveryPasswordUseCase {
  private readonly logger = new Logger(RecoveryPasswordUseCase.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly resendService: ResendService,
  ) {}

  async execute(email: string): Promise<void> {
    this.logger.log(`Attempting to recovery password for user email: ${email}`);

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(
        `Password recovery failed: User not found - Email: ${email}`,
      );
      throw new UnauthorizedException('User not found');
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.resendService.sendEmail(
      user.email,
      'Recuperación de Contraseña',
      `Hola ${user.name}, <br>tu nueva contraseña es: ${newPassword}`,
    );

    await this.authRepository.update(user.id, { password: hashedNewPassword });
    this.logger.log(
      `Password changed successfully for user: ${user.email} New Password: ${newPassword}`,
    );
  }
}
