import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthRepository } from '@auth/domain/repositories/auth.repository';
import { AUTH_REPOSITORY_TOKEN } from '@auth/auth.module';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    this.logger.log(`Attempting login for user: ${email}`);

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: User not found - ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user - ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${user.email}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        { expiresIn: '7d' },
      ),
    ]);

    await this.authRepository.saveRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
