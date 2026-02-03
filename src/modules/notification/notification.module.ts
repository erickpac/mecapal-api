import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';

// Controller
import { NotificationController } from './infrastructure/controllers/notification.controller';

// Repository
import { NotificationRepository } from './infrastructure/repositories/notification.repository';

// Service
import { NotificationService } from './infrastructure/services/notification.service';

// Use Cases
import {
  GetUserNotificationsUseCase,
  GetUnreadCountUseCase,
  MarkAsReadUseCase,
  MarkAllAsReadUseCase,
  DeleteNotificationUseCase,
  DeleteAllNotificationsUseCase,
  SendNotificationUseCase,
  SendBulkNotificationUseCase,
} from './application/use-cases';

// Tokens
import { NOTIFICATION_TOKENS } from './domain/constants';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [NotificationController],
  providers: [
    // Repository
    {
      provide: NOTIFICATION_TOKENS.INotificationRepository,
      useClass: NotificationRepository,
    },

    // Service
    {
      provide: NOTIFICATION_TOKENS.INotificationService,
      useClass: NotificationService,
    },

    // Use Cases
    GetUserNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkAsReadUseCase,
    MarkAllAsReadUseCase,
    DeleteNotificationUseCase,
    DeleteAllNotificationsUseCase,
    SendNotificationUseCase,
    SendBulkNotificationUseCase,
  ],
  exports: [
    NOTIFICATION_TOKENS.INotificationRepository,
    NOTIFICATION_TOKENS.INotificationService,
    SendNotificationUseCase,
    SendBulkNotificationUseCase,
  ],
})
export class NotificationModule {}
