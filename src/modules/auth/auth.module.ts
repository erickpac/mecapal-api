import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { RecoveryPasswordUseCase } from './application/use-cases/recovery-password.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { ResendModule } from '../resend/resend.module';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { AUTH_TOKENS } from './domain/constants/injection-tokens';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    ResendModule,
  ],
  controllers: [AuthController],
  providers: [
    // Exception Filter
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // Strategies
    JwtStrategy,
    // Repository implementations
    {
      provide: AUTH_TOKENS.IAuthRepository,
      useClass: AuthRepository,
    },
    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    RecoveryPasswordUseCase,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
