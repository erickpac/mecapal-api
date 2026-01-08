import { Injectable, Logger, Inject } from '@nestjs/common';
import { IProfileRepository } from '../../domain/repositories/profile.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../../../cognito/domain/entities/user.entity';

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
  ): Promise<User> {
    this.logger.log(`Updating profile for user ID: ${userId}`);

    const updatedUser = await this.profileRepository.update(
      userId,
      updateProfileDto,
    );

    return updatedUser;
  }
}
