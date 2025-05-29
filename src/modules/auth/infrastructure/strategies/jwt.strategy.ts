import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthRepository } from '@auth/domain/repositories/auth.repository';
import { AccessTokenPayload } from '@auth/domain/types/refresh-token-payload.type';
import { User } from '@auth/domain/entities/user.entity';
import { Inject } from '@nestjs/common';
import { AUTH_REPOSITORY_TOKEN } from '@auth/auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(AUTH_REPOSITORY_TOKEN)
    private readonly authRepository: IAuthRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<User> {
    const { sub } = payload;

    // Verify user still exists in database
    const user = await this.authRepository.findById(sub);

    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    // Return user object (will be attached to request as req.user)
    return user;
  }
}
