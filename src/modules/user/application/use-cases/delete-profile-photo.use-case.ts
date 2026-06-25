import { Inject, Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { IS3Service } from '../../../upload/domain/interfaces/s3.service.interface';
import { UPLOAD_TOKENS } from '../../../upload/domain/constants/injection-tokens';

@Injectable()
export class DeleteProfilePhotoUseCase {
  private readonly logger = new Logger(DeleteProfilePhotoUseCase.name);

  constructor(
    @Inject(USER_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(UPLOAD_TOKENS.IS3Service)
    private readonly s3Service: IS3Service,
  ) {}

  async execute(userId: string): Promise<User> {
    this.logger.log(`Deleting profile photo for user ${userId}`);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const oldUrl = user.profilePhotoUrl;

    // Persist the cleared field first so a later S3 delete failure can't
    // leave the user pointing at a no-longer-existing object.
    await this.userRepository.update(userId, { profilePhotoUrl: null });

    // Best-effort hard delete of the previous S3 object. The profile photo
    // is not accounting/reporting data, so it is removed immediately (not
    // soft deleted). Errors are logged and swallowed — an orphan object is
    // recoverable, a broken response is not.
    if (oldUrl) {
      const key = this.s3Service.extractKeyFromUrl(oldUrl);
      if (key) {
        try {
          await this.s3Service.deleteObjects([key]);
        } catch (err) {
          this.logger.warn(
            `Failed to delete profile photo object for user ${userId}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }
    }

    // Return the freshest representation including the transporter profile
    // so consumers can replace the whole user object in their store.
    const refreshed = await this.userRepository.findByIdWithProfile(userId);
    if (!refreshed) {
      throw new UserNotFoundException(userId);
    }

    return refreshed;
  }
}
