import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { RecoveryPasswordUseCase } from './application/use-cases/recovery-password.use-case';
import { ResendModule } from 'src/modules/resend/resend.module';

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
    JwtStrategy,
    AuthRepository,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    RecoveryPasswordUseCase,
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
