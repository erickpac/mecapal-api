import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProcessScheduledDeletionsUseCase } from '../../application/use-cases/process-scheduled-deletions.use-case';

// Unique advisory lock key — do not reuse across jobs.
const ACCOUNT_DELETION_LOCK_KEY = 910001;

@Injectable()
export class AccountDeletionScheduler {
  private readonly logger = new Logger(AccountDeletionScheduler.name);

  constructor(
    private readonly processScheduledDeletions: ProcessScheduledDeletionsUseCase,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private isEnabled(): boolean {
    return (
      this.config.get<string>('SCHEDULER_ACCOUNT_DELETION_ENABLED') !== 'false'
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledDeletions(): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug(
        'Disabled via SCHEDULER_ACCOUNT_DELETION_ENABLED=false',
      );
      return;
    }
    this.logger.debug('Running scheduled account deletions...');
    try {
      const outcome = await this.prisma.withAdvisoryLock(
        ACCOUNT_DELETION_LOCK_KEY,
        () => this.processScheduledDeletions.execute(),
      );

      if (!outcome.acquired) {
        this.logger.debug('Skipped — another instance holds the lock');
        return;
      }

      const { result } = outcome;
      if (result.processed > 0 || result.failed > 0) {
        this.logger.log(
          `Scheduled deletions: ${result.processed} processed, ${result.failed} failed`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Scheduled deletion job crashed: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    }
  }
}
