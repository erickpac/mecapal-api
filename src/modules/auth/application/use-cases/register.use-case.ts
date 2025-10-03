import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository';
import { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import { AUTH_TOKENS } from '../../domain/constants/injection-tokens';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../domain/entities/user.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

/**
 * Register Use Case
 * Handles user registration with password hashing
 */
@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(AUTH_TOKENS.IAuthRepository)
    private readonly authRepository: IAuthRepository,
    @Inject(AUTH_TOKENS.IPasswordHasher)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(registerDto: RegisterDto): Promise<User> {
    this.logger.log(`Attempting to register new user: ${registerDto.email}`);

    const existingUser = await this.authRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email already exists - ${registerDto.email}`,
      );
      throw new UserAlreadyExistsException(registerDto.email);
    }

    const hashedPassword = await this.passwordHasher.hash(registerDto.password);
    const user = await this.authRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    return user;
  }
}
