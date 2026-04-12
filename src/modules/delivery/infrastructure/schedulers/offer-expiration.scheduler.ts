import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { DELIVERY_TOKENS } from '../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../domain/repositories/delivery-request.repository';
import { IDeliveryOfferRepository } from '../../domain/repositories/delivery-offer.repository';
import { DeliveryRequestStatus } from '../../domain/enums/delivery-request-status.enum';

// Unique advisory lock key — do not reuse across jobs.
const OFFER_EXPIRATION_LOCK_KEY = 910002;

@Injectable()
export class OfferExpirationScheduler {
  private readonly logger = new Logger(OfferExpirationScheduler.name);

  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private isEnabled(): boolean {
    return (
      this.config.get<string>('SCHEDULER_OFFER_EXPIRATION_ENABLED') !== 'false'
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOfferExpiration(): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug(
        'Disabled via SCHEDULER_OFFER_EXPIRATION_ENABLED=false',
      );
      return;
    }
    this.logger.debug('Running offer expiration check...');

    const outcome = await this.prisma.withAdvisoryLock(
      OFFER_EXPIRATION_LOCK_KEY,
      () => this.processExpirations(),
    );

    if (!outcome.acquired) {
      this.logger.debug('Skipped — another instance holds the lock');
    }
  }

  private async processExpirations(): Promise<void> {
    try {
      const expiredRequests =
        await this.deliveryRequestRepository.findExpired();

      if (expiredRequests.length === 0) {
        this.logger.debug('No expired requests found');
        return;
      }

      this.logger.log(`Found ${expiredRequests.length} expired request(s)`);

      for (const request of expiredRequests) {
        try {
          const expiredCount =
            await this.deliveryOfferRepository.expireAllPendingByRequestId(
              request.id,
            );

          await this.deliveryRequestRepository.updateStatus(
            request.id,
            DeliveryRequestStatus.CANCELLED,
          );

          this.logger.log(
            `Request ${request.id}: expired ${expiredCount} offer(s), status set to CANCELLED`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to expire request ${request.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Offer expiration job failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
