import { SettlementStatus } from '../enums';

export interface SettlementProps {
  id: string;
  amount: number;
  status: SettlementStatus;
  transferDate?: Date;
  transactionNumber?: string;
  comment?: string;
  screenshotUrl?: string;
  paidAt?: Date;
  orderId: string;
  transporterId: string;
  bankAccountId?: string;
  registeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Settlement {
  readonly id: string;
  readonly amount: number;
  readonly status: SettlementStatus;
  readonly transferDate?: Date;
  readonly transactionNumber?: string;
  readonly comment?: string;
  readonly screenshotUrl?: string;
  readonly paidAt?: Date;
  readonly orderId: string;
  readonly transporterId: string;
  readonly bankAccountId?: string;
  readonly registeredBy?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: SettlementProps) {
    this.id = props.id;
    this.amount = props.amount;
    this.status = props.status;
    this.transferDate = props.transferDate;
    this.transactionNumber = props.transactionNumber;
    this.comment = props.comment;
    this.screenshotUrl = props.screenshotUrl;
    this.paidAt = props.paidAt;
    this.orderId = props.orderId;
    this.transporterId = props.transporterId;
    this.bankAccountId = props.bankAccountId;
    this.registeredBy = props.registeredBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPending(): boolean {
    return this.status === SettlementStatus.PENDING;
  }

  isPaid(): boolean {
    return this.status === SettlementStatus.PAID;
  }
}
