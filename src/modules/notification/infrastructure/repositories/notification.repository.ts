import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  INotificationRepository,
  CreateNotificationData,
  NotificationFilters,
} from '../../domain/interfaces';
import { Notification } from '../../domain/entities';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import {
  Notification as PrismaNotification,
  NotificationType as PrismaNotificationType,
  NotificationChannel as PrismaNotificationChannel,
  NotificationStatus as PrismaNotificationStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type as PrismaNotificationType,
        title: data.title,
        message: data.message,
        data: data.data as Prisma.JsonObject,
        channels: data.channels as PrismaNotificationChannel[],
        userId: data.userId,
      },
    });

    return this.mapToEntity(notification);
  }

  async createMany(data: CreateNotificationData[]): Promise<number> {
    const result = await this.prisma.notification.createMany({
      data: data.map((d) => ({
        type: d.type as PrismaNotificationType,
        title: d.title,
        message: d.message,
        data: d.data as Prisma.JsonObject,
        channels: d.channels as PrismaNotificationChannel[],
        userId: d.userId,
      })),
    });

    return result.count;
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) return null;
    return this.mapToEntity(notification);
  }

  async findByUserId(
    userId: string,
    filters?: NotificationFilters,
  ): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = { userId };

    if (filters?.type) {
      where.type = filters.type as PrismaNotificationType;
    }

    if (filters?.status) {
      where.status = filters.status as PrismaNotificationStatus;
    }

    if (filters?.unreadOnly) {
      where.readAt = null;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return notifications.map((n) => this.mapToEntity(n));
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        readAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => this.mapToEntity(n));
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        status: PrismaNotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return this.mapToEntity(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        status: PrismaNotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  async markAsSent(id: string): Promise<Notification> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        status: PrismaNotificationStatus.SENT,
        sentAt: new Date(),
      },
    });

    return this.mapToEntity(notification);
  }

  async markAsFailed(id: string, error: string): Promise<Notification> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        status: PrismaNotificationStatus.FAILED,
        failedAt: new Date(),
        error,
      },
    });

    return this.mapToEntity(notification);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  private mapToEntity(notification: PrismaNotification): Notification {
    return new Notification({
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      data: notification.data as Record<string, unknown> | undefined,
      channels: notification.channels as NotificationChannel[],
      status: notification.status as NotificationStatus,
      sentAt: notification.sentAt ?? undefined,
      readAt: notification.readAt ?? undefined,
      failedAt: notification.failedAt ?? undefined,
      error: notification.error ?? undefined,
      userId: notification.userId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
  }
}
