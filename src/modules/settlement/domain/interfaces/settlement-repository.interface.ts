import { Settlement } from '../entities';
import { SettlementStatus } from '../enums';

export interface CreateSettlementData {
  orderId: string;
  transporterId: string;
  amount: number;
}

export interface RecordPaymentData {
  transferDate: Date;
  transactionNumber: string;
  comment?: string;
  screenshotUrl?: string;
  bankAccountId?: string;
  registeredBy: string;
}

export interface SettlementFilters {
  status?: SettlementStatus;
  transporterId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface ISettlementRepository {
  create(data: CreateSettlementData): Promise<Settlement>;
  findById(id: string): Promise<Settlement | null>;
  findByOrderId(orderId: string): Promise<Settlement | null>;
  findByTransporterId(transporterId: string): Promise<Settlement[]>;
  findPending(): Promise<Settlement[]>;
  findByFilters(filters: SettlementFilters): Promise<Settlement[]>;
  recordPayment(id: string, data: RecordPaymentData): Promise<Settlement>;
  existsByOrderId(orderId: string): Promise<boolean>;
  getTotalPendingByTransporterId(transporterId: string): Promise<number>;
  getTotalPaidByTransporterId(transporterId: string): Promise<number>;
}
