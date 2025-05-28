import { Injectable, ConflictException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.authRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
