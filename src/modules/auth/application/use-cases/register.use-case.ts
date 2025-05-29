import { Injectable, ConflictException, Logger, Inject } from '@nestjs/common';
import { IAuthRepository } from '@auth/domain/repositories/auth.repository';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '@auth/domain/entities/user.entity';
import { AUTH_REPOSITORY_TOKEN } from '@auth/auth.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    this.logger.log(`Attempting to register new user: ${registerDto.email}`);

    const existingUser = await this.authRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email already exists - ${registerDto.email}`,
      );
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    this.logger.log(`User registered successfully: ${user.email}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
