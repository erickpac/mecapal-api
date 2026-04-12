import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 2;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Attempting database connection (${attempt}/${maxRetries})...`,
        );
        await this.$connect();
        this.logger.log('Prisma service initialized');
        return;
      } catch (error) {
        this.logger.error(
          `Database connection attempt ${attempt} failed: ${error}`,
        );
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Runs `fn` only if the caller can acquire a Postgres session-level
   * advisory lock identified by `lockKey`. Returns `false` when the lock
   * is already held by another session (and `fn` is skipped). Prevents
   * concurrent execution of scheduled jobs across multiple ECS task
   * instances.
   *
   * Pick a unique integer per job and keep it stable (a collision means
   * two jobs can never run in parallel).
   */
  async withAdvisoryLock<T>(
    lockKey: number,
    fn: () => Promise<T>,
  ): Promise<{ acquired: true; result: T } | { acquired: false }> {
    const rows = await this.$queryRawUnsafe<{ locked: boolean }[]>(
      `SELECT pg_try_advisory_lock($1) AS locked`,
      lockKey,
    );
    if (!rows[0]?.locked) {
      return { acquired: false };
    }
    try {
      const result = await fn();
      return { acquired: true, result };
    } finally {
      await this.$queryRawUnsafe(`SELECT pg_advisory_unlock($1)`, lockKey);
    }
  }
}
