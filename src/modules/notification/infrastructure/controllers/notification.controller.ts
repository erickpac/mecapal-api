import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  GetUserNotificationsUseCase,
  GetUnreadCountUseCase,
  MarkAsReadUseCase,
  MarkAllAsReadUseCase,
  DeleteNotificationUseCase,
  DeleteAllNotificationsUseCase,
} from '../../application/use-cases';
import { NotificationQueryDto } from '../../application/dtos';

interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

@Controller('notifications')
@UseGuards(CognitoAuthGuard)
export class NotificationController {
  constructor(
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
    private readonly deleteAllNotificationsUseCase: DeleteAllNotificationsUseCase,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationQueryDto,
  ) {
    return this.getUserNotificationsUseCase.execute(user.userId, query);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.getUnreadCountUseCase.execute(user.userId);
    return { count };
  }

  @Post(':id/read')
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markAsReadUseCase.execute(id, user.userId);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.markAllAsReadUseCase.execute(user.userId);
    return { count };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteNotificationUseCase.execute(id, user.userId);
    return { success: true };
  }

  @Delete()
  async deleteAll(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.deleteAllNotificationsUseCase.execute(user.userId);
    return { count };
  }
}
