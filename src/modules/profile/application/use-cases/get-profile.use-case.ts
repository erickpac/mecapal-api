import { Injectable, Logger, Inject } from '@nestjs/common';
import { User } from '../../../auth/domain/entities/user.entity';
import { IProfileRepository } from '../../domain/repositories/profile.repository';
import { PROFILE_TOKENS } from '../../domain/constants/injection-tokens';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(
    @Inject(PROFILE_TOKENS.IProfileRepository)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(userId: string): Promise<Omit<User, 'password'>> {
    this.logger.log(`Fetching profile for user ID: ${userId}`);

    const user = await this.profileRepository.findById(userId);

    if (!user) {
      this.logger.warn(`Profile not found for user ID: ${userId}`);
      throw new ProfileNotFoundException(userId);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }
}
