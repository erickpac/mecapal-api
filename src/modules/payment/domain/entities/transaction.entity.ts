import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';
import { PaymentMethod } from './payment-method.entity';

export class Transaction {
  id: string;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  subtotal: number;
  commissionAmount: number;
  taxAmount: number;
  refundedAmount: number;
  failureCode?: string;
  failureMessage?: string;
  userId: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  deliveryOfferId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }

  get isSuccessful(): boolean {
    return this.status === TransactionStatus.SUCCEEDED;
  }

  get isPending(): boolean {
    return (
      this.status === TransactionStatus.PENDING ||
      this.status === TransactionStatus.PROCESSING
    );
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get isRefundable(): boolean {
    return (
      this.status === TransactionStatus.SUCCEEDED &&
      this.refundedAmount < this.amount
    );
  }

  get remainingRefundableAmount(): number {
    return this.amount - this.refundedAmount;
  }
}
