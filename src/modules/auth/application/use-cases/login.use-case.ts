import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { LoginDto } from '../dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RefreshTokenPayload } from '../../domain/types/refresh-token-payload.type';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(loginDto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: Omit<User, 'password'>;
  }> {
    this.logger.log(`Attempting login for user: ${loginDto.email}`);

    const user = await this.authRepository.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(`Login failed: User not found - ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password for user - ${loginDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${user.email}`);

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
      jti: crypto.randomUUID(),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: await this.jwtService.signAsync(accessTokenPayload),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      }),
      user: userWithoutPassword,
    };
  }
}
