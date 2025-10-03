import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from '../../../auth/domain/entities/user.entity';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string): Promise<Omit<User, 'password'>> {
    this.logger.log(`Fetching profile for user ID: ${userId}`);

    const user = await this.profileRepository.findById(userId);

    if (!user) {
      this.logger.warn(`Profile not found for user ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  }
}
