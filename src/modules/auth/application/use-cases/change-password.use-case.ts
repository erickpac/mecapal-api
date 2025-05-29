import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '@auth/domain/repositories/auth.repository';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { AUTH_REPOSITORY_TOKEN } from '@auth/auth.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordUseCase {
  private readonly logger = new Logger(ChangePasswordUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
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
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Password change failed: Current password is incorrect for user - ${user.email}`,
      );
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.new_password,
      10,
    );

    await this.authRepository.update(userId, { password: hashedNewPassword });
    this.logger.log(`Password changed successfully for user: ${user.email}`);
  }
}
