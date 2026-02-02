import { OrderStatus } from '../enums';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderLocation } from './order-location.entity';
import type { DeliveryOffer } from '../../../delivery/domain/entities/delivery-offer.entity';
import type { Transaction } from '../../../payment/domain/entities/transaction.entity';

export interface OrderProps {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  confirmedAt: Date;
  inProgressAt?: Date;
  pickedUpAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  deliveryPhotoUrl?: string;
  deliverySignature?: string;
  deliveryNotes?: string;
  receiverName?: string;
  deliveredToAddress?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  deliveryOfferId: string;
  deliveryOffer?: DeliveryOffer;
  transactionId: string;
  transaction?: Transaction;
  clientId: string;
  transporterId: string;
  statusHistory?: OrderStatusHistory[];
  locationUpdates?: OrderLocation[];
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OrderStatus;
  readonly confirmedAt: Date;
  readonly inProgressAt?: Date;
  readonly pickedUpAt?: Date;
  readonly inTransitAt?: Date;
  readonly deliveredAt?: Date;
  readonly completedAt?: Date;
  readonly cancelledAt?: Date;
  readonly deliveryPhotoUrl?: string;
  readonly deliverySignature?: string;
  readonly deliveryNotes?: string;
  readonly receiverName?: string;
  readonly deliveredToAddress?: string;
  readonly cancellationReason?: string;
  readonly cancelledBy?: string;
  readonly deliveryOfferId: string;
  readonly deliveryOffer?: DeliveryOffer;
  readonly transactionId: string;
  readonly transaction?: Transaction;
  readonly clientId: string;
  readonly transporterId: string;
  readonly statusHistory?: OrderStatusHistory[];
  readonly locationUpdates?: OrderLocation[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.orderNumber = props.orderNumber;
    this.status = props.status;
    this.confirmedAt = props.confirmedAt;
    this.inProgressAt = props.inProgressAt;
    this.pickedUpAt = props.pickedUpAt;
    this.inTransitAt = props.inTransitAt;
    this.deliveredAt = props.deliveredAt;
    this.completedAt = props.completedAt;
    this.cancelledAt = props.cancelledAt;
    this.deliveryPhotoUrl = props.deliveryPhotoUrl;
    this.deliverySignature = props.deliverySignature;
    this.deliveryNotes = props.deliveryNotes;
    this.receiverName = props.receiverName;
    this.deliveredToAddress = props.deliveredToAddress;
    this.cancellationReason = props.cancellationReason;
    this.cancelledBy = props.cancelledBy;
    this.deliveryOfferId = props.deliveryOfferId;
    this.deliveryOffer = props.deliveryOffer;
    this.transactionId = props.transactionId;
    this.transaction = props.transaction;
    this.clientId = props.clientId;
    this.transporterId = props.transporterId;
    this.statusHistory = props.statusHistory;
    this.locationUpdates = props.locationUpdates;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isActive(): boolean {
    return ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(
      this.status,
    );
  }

  canBeUpdatedByTransporter(): boolean {
    return [
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PROGRESS,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
    ].includes(this.status);
  }

  canBeCancelled(): boolean {
    return [OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS].includes(
      this.status,
    );
  }
}
