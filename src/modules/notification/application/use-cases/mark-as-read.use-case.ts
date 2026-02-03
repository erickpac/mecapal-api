import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants/injection-tokens';
import { INotificationRepository } from '../../domain/interfaces';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class MarkAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string): Promise<Notification> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException(
        `Notification with id ${notificationId} not found`,
      );
    }

    if (notification.userId !== userId) {
      throw new NotFoundException(
        `Notification with id ${notificationId} not found`,
      );
    }

    return this.notificationRepository.markAsRead(notificationId);
  }
}
