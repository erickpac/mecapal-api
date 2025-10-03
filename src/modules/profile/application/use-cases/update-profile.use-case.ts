import { Injectable, Logger, Inject } from '@nestjs/common';
import { IProfileRepository } from '../../domain/repositories/profile.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { EmailAlreadyTakenException } from '../../domain/exceptions/email-already-taken.exception';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../../../auth/domain/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  private readonly logger = new Logger(UpdateProfileUseCase.name);

  constructor(
    @Inject(PROFILE_TOKENS.IProfileRepository)
    private readonly profileRepository: IProfileRepository,
  ) {}

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
        throw new EmailAlreadyTakenException(updateProfileDto.email);
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
