import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants/injection-tokens';
import {
  INotificationRepository,
  INotificationService,
  CreateNotificationData,
} from '../../domain/interfaces';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface SendBulkNotificationInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

@Injectable()
export class SendBulkNotificationUseCase {
  private readonly logger = new Logger(SendBulkNotificationUseCase.name);

  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @Inject(NOTIFICATION_TOKENS.INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: SendBulkNotificationInput): Promise<number> {
    const channels = input.channels || [NotificationChannel.IN_APP];

    // Create notifications for all users
    const notificationData: CreateNotificationData[] = input.userIds.map(
      (userId) => ({
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data,
        channels,
        userId,
      }),
    );

    const createdCount =
      await this.notificationRepository.createMany(notificationData);

    // Send through notification service
    try {
      await this.notificationService.sendBulk({
        userIds: input.userIds,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data,
        channels,
      });
    } catch (error) {
      this.logger.error(`Failed to send bulk notifications: ${error.message}`);
    }

    return createdCount;
  }
}
