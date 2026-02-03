import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants/injection-tokens';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../domain/interfaces';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class GetUserNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(
    userId: string,
    filters?: NotificationFilters,
  ): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, {
      ...filters,
      userId,
    });
  }
}
