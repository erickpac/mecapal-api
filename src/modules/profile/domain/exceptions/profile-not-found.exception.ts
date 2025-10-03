import { DomainException } from './domain.exception';

export class ProfileNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`Profile for user with ID ${userId} not found`, 'PROFILE_NOT_FOUND');
  }
}
