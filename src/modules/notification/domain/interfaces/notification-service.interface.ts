import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';

export interface SendNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface BulkNotificationPayload {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export interface INotificationService {
  send(payload: SendNotificationPayload): Promise<void>;
  sendBulk(payload: BulkNotificationPayload): Promise<void>;
  sendPush(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  sendEmail(userId: string, subject: string, body: string): Promise<void>;
  sendSms(userId: string, message: string): Promise<void>;
}
