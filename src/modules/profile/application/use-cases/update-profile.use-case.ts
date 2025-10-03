import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../../../auth/domain/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  private readonly logger = new Logger(UpdateProfileUseCase.name);

  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    this.logger.log(`Updating profile for user ID: ${userId}`);

    // Check if email is being updated and if it's already taken
    if (updateProfileDto.email) {
      const existingUser = await this.profileRepository.findByEmail(
        updateProfileDto.email,
      );
      if (existingUser && existingUser.id !== userId) {
        this.logger.warn(
          `Email update failed: Email already taken - ${updateProfileDto.email}`,
        );
        throw new ConflictException('Email already taken');
      }
    }

    const updatedUser = await this.profileRepository.update(
      userId,
      updateProfileDto,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
