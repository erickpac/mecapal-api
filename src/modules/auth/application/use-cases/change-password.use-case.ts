import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { AUTH_TOKENS } from '../../domain/constants/injection-tokens';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidPasswordException } from '../../domain/exceptions/invalid-password.exception';

/**
 * Change Password Use Case
 * Handles password change after validating current password
 */
@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(AUTH_TOKENS.IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(AUTH_TOKENS.IPasswordHasher)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    this.logger.log(`Attempting to change password for user ID: ${userId}`);

    const user = await this.authRepository.findById(userId);

    if (!user) {
      this.logger.warn(
        `Password change failed: User not found - ID: ${userId}`,
      );
      throw new UserNotFoundException(userId);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Password change failed: Current password is incorrect for user - ${user.email}`,
      );
      throw new InvalidPasswordException();
    }

    const hashedNewPassword = await this.passwordHasher.hash(
      changePasswordDto.new_password,
    );

    await this.authRepository.update(userId, { password: hashedNewPassword });
    this.logger.log(`Password changed successfully for user: ${user.email}`);
  }
}
