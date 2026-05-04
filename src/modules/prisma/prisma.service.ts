import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, type PoolConfig } from 'pg';

/**
 * Build the pg Pool config from the DATABASE_URL env var.
 *
 * - If the URL already declares a `sslmode` query param we respect it and let
 *   `pg` derive the SSL options from the connection string itself (no extra
 *   `ssl` option).
 * - Otherwise we default to `{ rejectUnauthorized: false }` to support the
 *   AWS RDS bundle without distributing the CA cert with the image. This
 *   matches the previous Prisma behaviour for managed Postgres.
 */
function buildPoolConfig(connectionString: string): PoolConfig {
  const config: PoolConfig = {
    connectionString,
    max: 10,
  };

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get('sslmode');
    if (!sslmode) {
      config.ssl = { rejectUnauthorized: false };
    }
  } catch {
    // Non-URL connection strings (e.g. KV form). Fall back to the RDS-friendly
    // default so we keep parity with previous Prisma behaviour.
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL', '');
    const pool = new Pool(buildPoolConfig(connectionString));
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

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
    await this.pool.end();
  }

  /**
   * Runs `fn` only if the caller can acquire a Postgres session-level
   * advisory lock identified by `lockKey`. Returns `acquired: false` when the
   * lock is already held by another session (and `fn` is skipped). Prevents
   * concurrent execution of scheduled jobs across multiple ECS task instances.
   *
   * Acquire and release run on the same dedicated pool connection so the
   * `pg_advisory_unlock` actually releases the lock — Postgres advisory locks
   * are session-scoped, and Prisma queries through the pool may otherwise
   * land on a different connection where the unlock would be a no-op.
   * `fn` itself can use any pool connection (queries through PrismaClient);
   * the lock is global across the database, not connection-bound.
   *
   * Pick a unique integer per job and keep it stable (a collision means
   * two jobs can never run in parallel).
   */
  async withAdvisoryLock<T>(
    lockKey: number,
    fn: () => Promise<T>,
  ): Promise<{ acquired: true; result: T } | { acquired: false }> {
    const client = await this.pool.connect();
    try {
      const lockResult = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1) AS locked',
        [lockKey],
      );
      if (!lockResult.rows[0]?.locked) {
        return { acquired: false };
      }
      try {
        const result = await fn();
        return { acquired: true, result };
      } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [lockKey]);
      }
    } finally {
      client.release();
    }
  }
}
