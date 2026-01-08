import { Injectable, Logger, Inject } from '@nestjs/common';
import { User } from '../../../cognito/domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

@Injectable()
export class GetUserUseCase {
  private readonly logger = new Logger(GetUserUseCase.name);

  constructor(
    @Inject(USER_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${userId}`);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new UserNotFoundException(userId);
    }

    return user;
  }
}
