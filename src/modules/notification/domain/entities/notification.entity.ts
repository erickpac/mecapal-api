import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export class Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  sentAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  error?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }
}
