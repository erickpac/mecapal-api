import { BankAccount } from '../entities';
import { BankAccountType, BankAccountStatus } from '../enums';

export interface CreateBankAccountData {
  bankName: string;
  accountHolderName: string;
  accountType: BankAccountType;
  accountNumber: string;
  accountNumberLast4: string;
  verificationDocUrl?: string;
}

export interface UpdateBankAccountData {
  bankName?: string;
  accountHolderName?: string;
  verificationDocUrl?: string;
}

export interface VerifyBankAccountData {
  status: BankAccountStatus;
  rejectionReason?: string;
}

export interface IBankAccountRepository {
  create(
    transporterId: string,
    data: CreateBankAccountData,
  ): Promise<BankAccount>;
  findById(id: string): Promise<BankAccount | null>;
  findByTransporterId(transporterId: string): Promise<BankAccount[]>;
  findDefaultByTransporterId(
    transporterId: string,
  ): Promise<BankAccount | null>;
  findVerifiedByTransporterId(transporterId: string): Promise<BankAccount[]>;
  update(id: string, data: UpdateBankAccountData): Promise<BankAccount>;
  setDefault(transporterId: string, bankAccountId: string): Promise<void>;
  verify(id: string, data: VerifyBankAccountData): Promise<BankAccount>;
  delete(id: string): Promise<void>;
  existsByAccountNumber(
    transporterId: string,
    accountNumber: string,
  ): Promise<boolean>;
}
