import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export type DeletionBlocker =
  | 'ACTIVE_ORDERS'
  | 'PENDING_SETTLEMENTS'
  | 'OPEN_INCIDENTS'
  | 'ACTIVE_DELIVERY_REQUESTS';

/**
 * Account deletion domain exceptions extend the shared `DomainException`
 * so they are emitted through the standardized contract by the global
 * `GlobalExceptionFilter`. Contextual fields (`blockers`, `scheduledFor`)
 * are surfaced via the `details` getter.
 */
export class AccountDeletionBlockedException extends DomainException {
  constructor(public readonly blockers: DeletionBlocker[]) {
    super(
      'Account cannot be deleted while there are pending obligations.',
      ErrorCode.DELETION_BLOCKED,
      HttpStatus.CONFLICT,
    );
  }

  get details(): Record<string, unknown> {
    return { blockers: this.blockers };
  }
}

export class AccountAlreadyScheduledForDeletionException extends DomainException {
  constructor(public readonly scheduledFor: Date) {
    super(
      'Account is already scheduled for deletion.',
      ErrorCode.DELETION_ALREADY_SCHEDULED,
      HttpStatus.CONFLICT,
    );
  }

  get details(): Record<string, unknown> {
    return { scheduledFor: this.scheduledFor };
  }
}

export class AccountNotScheduledForDeletionException extends DomainException {
  constructor() {
    super(
      'Account is not scheduled for deletion.',
      ErrorCode.DELETION_NOT_SCHEDULED,
      HttpStatus.NOT_FOUND,
    );
  }
}
