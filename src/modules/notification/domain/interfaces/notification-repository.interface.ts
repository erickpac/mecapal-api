import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  userId: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<Notification>;
  createMany(data: CreateNotificationData[]): Promise<number>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(
    userId: string,
    filters?: NotificationFilters,
  ): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<number>;
  markAsSent(id: string): Promise<Notification>;
  markAsFailed(id: string, error: string): Promise<Notification>;
  delete(id: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<number>;
}
