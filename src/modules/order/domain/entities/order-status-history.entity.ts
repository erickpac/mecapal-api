import { OrderStatus } from '../enums';

export interface OrderStatusHistoryProps {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  notes?: string;
  changedBy?: string;
  latitude?: number;
  longitude?: number;
  orderId: string;
  createdAt: Date;
}

export class OrderStatusHistory {
  readonly id: string;
  readonly fromStatus: OrderStatus | null;
  readonly toStatus: OrderStatus;
  readonly notes?: string;
  readonly changedBy?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly orderId: string;
  readonly createdAt: Date;

  constructor(props: OrderStatusHistoryProps) {
    this.id = props.id;
    this.fromStatus = props.fromStatus;
    this.toStatus = props.toStatus;
    this.notes = props.notes;
    this.changedBy = props.changedBy;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.orderId = props.orderId;
    this.createdAt = props.createdAt;
  }
}
