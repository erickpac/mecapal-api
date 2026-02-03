import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants/injection-tokens';
import {
  INotificationRepository,
  INotificationService,
} from '../../domain/interfaces';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { SendNotificationDto } from '../dtos';

@Injectable()
export class SendNotificationUseCase {
  private readonly logger = new Logger(SendNotificationUseCase.name);

  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @Inject(NOTIFICATION_TOKENS.INotificationService)
    private readonly notificationService: INotificationService,
  ) {}

  async execute(dto: SendNotificationDto): Promise<void> {
    const channels = dto.channels || [NotificationChannel.IN_APP];

    // Create notification in database
    const notification = await this.notificationRepository.create({
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data,
      channels,
      userId: dto.userId,
    });

    // Send through notification service
    try {
      await this.notificationService.send({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
        channels,
      });

      await this.notificationRepository.markAsSent(notification.id);
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id}: ${error.message}`,
      );
      await this.notificationRepository.markAsFailed(
        notification.id,
        error.message,
      );
    }
  }
}
