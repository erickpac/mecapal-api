import { DomainException } from './domain.exception';

export class EmailAlreadyTakenException extends DomainException {
  constructor(email: string) {
    super(`Email ${email} is already taken`, 'EMAIL_ALREADY_TAKEN');
  }
}
