export type DeletionBlocker =
  | 'ACTIVE_ORDERS'
  | 'PENDING_SETTLEMENTS'
  | 'OPEN_INCIDENTS'
  | 'ACTIVE_DELIVERY_REQUESTS';

export class AccountDeletionBlockedException extends Error {
  constructor(public readonly blockers: DeletionBlocker[]) {
    super('Account cannot be deleted while there are pending obligations.');
    this.name = 'AccountDeletionBlockedException';
  }
}

export class AccountAlreadyScheduledForDeletionException extends Error {
  constructor(public readonly scheduledFor: Date) {
    super('Account is already scheduled for deletion.');
    this.name = 'AccountAlreadyScheduledForDeletionException';
  }
}

export class AccountNotScheduledForDeletionException extends Error {
  constructor() {
    super('Account is not scheduled for deletion.');
    this.name = 'AccountNotScheduledForDeletionException';
  }
}
