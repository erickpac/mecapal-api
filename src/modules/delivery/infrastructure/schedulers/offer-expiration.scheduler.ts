import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DELIVERY_TOKENS } from '../../domain/constants/injection-tokens';
import { IDeliveryRequestRepository } from '../../domain/repositories/delivery-request.repository';
import { IDeliveryOfferRepository } from '../../domain/repositories/delivery-offer.repository';
import { DeliveryRequestStatus } from '../../domain/enums/delivery-request-status.enum';

@Injectable()
export class OfferExpirationScheduler {
  private readonly logger = new Logger(OfferExpirationScheduler.name);

  constructor(
    @Inject(DELIVERY_TOKENS.IDeliveryRequestRepository)
    private readonly deliveryRequestRepository: IDeliveryRequestRepository,
    @Inject(DELIVERY_TOKENS.IDeliveryOfferRepository)
    private readonly deliveryOfferRepository: IDeliveryOfferRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOfferExpiration(): Promise<void> {
    this.logger.debug('Running offer expiration check...');

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
          // Expire all pending offers for this request
          const expiredCount =
            await this.deliveryOfferRepository.expireAllPendingByRequestId(
              request.id,
            );

          // Update request status back to PUBLISHED (no offers accepted)
          // This allows the client to republish or cancel
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
