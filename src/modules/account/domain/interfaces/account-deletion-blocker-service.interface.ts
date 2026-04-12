import { DeletionBlocker } from '../exceptions/account-deletion.exceptions';

export interface IAccountDeletionBlockerService {
  findBlockers(userId: string): Promise<DeletionBlocker[]>;
}
