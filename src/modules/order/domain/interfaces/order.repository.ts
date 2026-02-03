import { Order, OrderStatusHistory, OrderLocation } from '../entities';
import { OrderStatus } from '../enums';

export interface CreateOrderData {
  deliveryOfferId: string;
  transactionId: string;
  clientId: string;
  transporterId: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
  changedBy?: string;
  latitude?: number;
  longitude?: number;
}

export interface ConfirmDeliveryData {
  deliveryPhotoUrl?: string;
  deliverySignature?: string;
  deliveryNotes?: string;
  receiverName?: string;
  deliveredToAddress?: string;
}

export interface CancelOrderData {
  cancellationReason: string;
  cancelledBy: string;
}

export interface AddLocationData {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
}

export interface IOrderRepository {
  // Order CRUD
  create(data: CreateOrderData): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByDeliveryOfferId(deliveryOfferId: string): Promise<Order | null>;
  findByTransactionId(transactionId: string): Promise<Order | null>;

  // Queries
  findByClientId(clientId: string, filters?: OrderFilters): Promise<Order[]>;
  findByTransporterId(
    transporterId: string,
    filters?: OrderFilters,
  ): Promise<Order[]>;
  findActiveByTransporterId(transporterId: string): Promise<Order | null>;

  // Updates
  updateStatus(
    id: string,
    data: UpdateOrderStatusData,
  ): Promise<Order>;
  confirmDelivery(id: string, data: ConfirmDeliveryData): Promise<Order>;
  cancelOrder(id: string, data: CancelOrderData): Promise<Order>;
  completeOrder(id: string): Promise<Order>;

  // Location tracking
  addLocationUpdate(orderId: string, data: AddLocationData): Promise<OrderLocation>;
  getLocationUpdates(orderId: string, limit?: number): Promise<OrderLocation[]>;
  getLatestLocation(orderId: string): Promise<OrderLocation | null>;

  // Status history
  getStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;

  // Order number generation
  generateOrderNumber(): Promise<string>;

  // Get net earnings for settlement
  getNetEarnings(orderId: string): Promise<number>;
}
