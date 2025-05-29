import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '@auth/presentation/controllers/auth.controller';
import { JwtStrategy } from '@auth/infrastructure/strategies/jwt.strategy';
import { AuthRepository } from '@auth/infrastructure/repositories/auth.repository';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '@auth/application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.use-case';
import { AuthMiddleware } from '@auth/middleware/auth.middleware';
import { PrismaModule } from '@prisma/prisma.module';

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY';

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
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: AuthRepository,
    },
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
