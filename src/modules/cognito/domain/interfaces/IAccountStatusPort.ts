/**
 * Optional port that the account module implements when the
 * account-deletion feature is enabled. Sign-in use cases can inject this
 * with `@Optional()` — if the feature is off the dependency is undefined
 * and the cancellation step is skipped.
 */
export interface IAccountStatusPort {
  cancelPendingDeletionIfAny(userId: string): Promise<void>;
}
