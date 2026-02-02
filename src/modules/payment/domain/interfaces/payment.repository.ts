import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { CardBrand } from '../enums/card-brand.enum';

export interface CreatePaymentMethodData {
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  cardBrand: CardBrand;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  isDefault?: boolean;
}

export interface CreateTransactionData {
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  amount: number;
  currency?: string;
  subtotal: number;
  commissionAmount: number;
  taxAmount: number;
  paymentMethodId?: string;
  deliveryOfferId: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTransactionData {
  status?: TransactionStatus;
  stripeChargeId?: string;
  refundedAmount?: number;
  failureCode?: string;
  failureMessage?: string;
}

export interface IPaymentRepository {
  // Payment Methods
  createPaymentMethod(
    userId: string,
    data: CreatePaymentMethodData,
  ): Promise<PaymentMethod>;
  findPaymentMethodById(id: string): Promise<PaymentMethod | null>;
  findPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]>;
  findDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null>;
  setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void>;
  deletePaymentMethod(id: string): Promise<void>;

  // Transactions
  createTransaction(
    userId: string,
    data: CreateTransactionData,
  ): Promise<Transaction>;
  findTransactionById(id: string): Promise<Transaction | null>;
  findTransactionByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Transaction | null>;
  findTransactionByDeliveryOfferId(
    deliveryOfferId: string,
  ): Promise<Transaction | null>;
  findTransactionsByUserId(userId: string): Promise<Transaction[]>;
  updateTransaction(
    id: string,
    data: UpdateTransactionData,
  ): Promise<Transaction>;

  // User
  getOrCreateStripeCustomerId(userId: string): Promise<string>;
  updateStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void>;
}
