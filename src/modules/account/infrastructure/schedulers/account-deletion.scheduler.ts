import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessScheduledDeletionsUseCase } from '../../application/use-cases/process-scheduled-deletions.use-case';

@Injectable()
export class AccountDeletionScheduler {
  private readonly logger = new Logger(AccountDeletionScheduler.name);

  constructor(
    private readonly processScheduledDeletions: ProcessScheduledDeletionsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledDeletions(): Promise<void> {
    this.logger.debug('Running scheduled account deletions...');
    try {
      const result = await this.processScheduledDeletions.execute();
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
