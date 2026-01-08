import { Injectable, Logger, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../../cognito/domain/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${userId}`);

    const updatedUser = await this.userRepository.update(userId, updateUserDto);

    return updatedUser;
  }
}
