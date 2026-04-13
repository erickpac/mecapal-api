import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const flag = (key: string, on: boolean) =>
    `  - ${key}: ${on ? 'ENABLED' : 'DISABLED'}`;
  logger.log(`Feature flags:`);
  logger.log(
    flag('ACCOUNT_DELETION', process.env.ACCOUNT_DELETION_ENABLED === 'true'),
  );
  logger.log(
    flag(
      'SCHEDULER_ACCOUNT_DELETION',
      process.env.SCHEDULER_ACCOUNT_DELETION_ENABLED !== 'false',
    ),
  );
  logger.log(
    flag(
      'SCHEDULER_OFFER_EXPIRATION',
      process.env.SCHEDULER_OFFER_EXPIRATION_ENABLED !== 'false',
    ),
  );
}

void bootstrap();
