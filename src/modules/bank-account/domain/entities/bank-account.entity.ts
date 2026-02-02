import { BankAccountType, BankAccountStatus } from '../enums';

export interface BankAccountProps {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountType: BankAccountType;
  accountNumber: string;
  accountNumberLast4: string;
  status: BankAccountStatus;
  verificationDocUrl?: string;
  verifiedAt?: Date;
  rejectionReason?: string;
  isDefault: boolean;
  transporterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BankAccount {
  readonly id: string;
  readonly bankName: string;
  readonly accountHolderName: string;
  readonly accountType: BankAccountType;
  readonly accountNumber: string;
  readonly accountNumberLast4: string;
  readonly status: BankAccountStatus;
  readonly verificationDocUrl?: string;
  readonly verifiedAt?: Date;
  readonly rejectionReason?: string;
  readonly isDefault: boolean;
  readonly transporterId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: BankAccountProps) {
    this.id = props.id;
    this.bankName = props.bankName;
    this.accountHolderName = props.accountHolderName;
    this.accountType = props.accountType;
    this.accountNumber = props.accountNumber;
    this.accountNumberLast4 = props.accountNumberLast4;
    this.status = props.status;
    this.verificationDocUrl = props.verificationDocUrl;
    this.verifiedAt = props.verifiedAt;
    this.rejectionReason = props.rejectionReason;
    this.isDefault = props.isDefault;
    this.transporterId = props.transporterId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isVerified(): boolean {
    return this.status === BankAccountStatus.VERIFIED;
  }

  canBeUsedForPayouts(): boolean {
    return this.status === BankAccountStatus.VERIFIED;
  }

  getMaskedAccountNumber(): string {
    return `****${this.accountNumberLast4}`;
  }
}
