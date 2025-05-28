import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.new_password,
      10,
    );

    await this.authRepository.update(userId, { password: hashedNewPassword });
  }
}
