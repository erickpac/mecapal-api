import { Injectable, Inject, Logger } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants';
import {
  INotificationService,
  INotificationRepository,
  SendNotificationPayload,
  BulkNotificationPayload,
} from '../../domain/interfaces';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async send(payload: SendNotificationPayload): Promise<void> {
    const channels = payload.channels || [NotificationChannel.IN_APP];

    // Create in-app notification
    const notification = await this.notificationRepository.create({
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      channels,
      userId: payload.userId,
    });

    this.logger.log(
      `Notification created: ${notification.id} for user ${payload.userId}`,
    );

    // Send through other channels
    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.PUSH:
            await this.sendPush(
              payload.userId,
              payload.title,
              payload.message,
              payload.data,
            );
            break;
          case NotificationChannel.EMAIL:
            await this.sendEmail(
              payload.userId,
              payload.title,
              payload.message,
            );
            break;
          case NotificationChannel.SMS:
            await this.sendSms(payload.userId, payload.message);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to send ${channel} notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Mark as sent
    await this.notificationRepository.markAsSent(notification.id);
  }

  async sendBulk(payload: BulkNotificationPayload): Promise<void> {
    const channels = payload.channels || [NotificationChannel.IN_APP];

    // Create in-app notifications for all users
    const notificationsData = payload.userIds.map((userId) => ({
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      channels,
      userId,
    }));

    const count = await this.notificationRepository.createMany(notificationsData);
    this.logger.log(`Bulk notification created for ${count} users`);

    // Note: For production, push/email/sms should be handled via a queue
    // to avoid blocking and to handle failures gracefully
  }

  async sendPush(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    // TODO: Implement Firebase Cloud Messaging integration
    this.logger.debug(
      `[STUB] Push notification to user ${userId}: ${title} - ${message}`,
    );
    // When implementing:
    // 1. Get user's FCM token from database
    // 2. Use Firebase Admin SDK to send push notification
    // 3. Handle token refresh/invalidation
  }

  async sendEmail(
    userId: string,
    subject: string,
    body: string,
  ): Promise<void> {
    // TODO: Implement SendGrid integration
    this.logger.debug(
      `[STUB] Email to user ${userId}: ${subject}`,
    );
    // When implementing:
    // 1. Get user's email from database
    // 2. Use SendGrid SDK to send email
    // 3. Handle bounces and complaints
  }

  async sendSms(userId: string, message: string): Promise<void> {
    // TODO: Implement Twilio integration
    this.logger.debug(
      `[STUB] SMS to user ${userId}: ${message}`,
    );
    // When implementing:
    // 1. Get user's phone from database
    // 2. Use Twilio SDK to send SMS
    // 3. Handle delivery status callbacks
  }
}
