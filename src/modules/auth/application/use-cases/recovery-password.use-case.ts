import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { AUTH_TOKENS } from '../../domain/constants/injection-tokens';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import * as bcrypt from 'bcrypt';
import { ResendService } from '../../../resend/resend.service';

/**
 * Recovery Password Use Case
 * Handles password recovery by generating a new password and sending it via email
 */
@Injectable()
export class RecoveryPasswordUseCase {
  private readonly logger = new Logger(RecoveryPasswordUseCase.name);

  constructor(
    @Inject(AUTH_TOKENS.IAuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly resendService: ResendService,
  ) {}

  async execute(email: string): Promise<void> {
    this.logger.log(`Attempting to recovery password for user email: ${email}`);

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      this.logger.warn(
        `Password recovery failed: User not found - Email: ${email}`,
      );
      throw new UserNotFoundException(email);
    }

    const newPassword = this.generateRandomPassword();
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

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8);
  }
}
