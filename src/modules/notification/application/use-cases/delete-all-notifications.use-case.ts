import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_TOKENS } from '../../domain/constants/injection-tokens';
import { INotificationRepository } from '../../domain/interfaces';

@Injectable()
export class DeleteAllNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_TOKENS.INotificationRepository)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.deleteAllByUserId(userId);
  }
}
