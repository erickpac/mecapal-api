import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IOrderRepository,
  CreateOrderData,
  UpdateOrderStatusData,
  ConfirmDeliveryData,
  CancelOrderData,
  AddLocationData,
  OrderFilters,
} from '../../domain/interfaces';
import { Order, OrderStatusHistory, OrderLocation } from '../../domain/entities';
import { OrderStatus } from '../../domain/enums';
import {
  Order as PrismaOrder,
  OrderStatusHistory as PrismaOrderStatusHistory,
  OrderLocation as PrismaOrderLocation,
  OrderStatus as PrismaOrderStatus,
  Prisma,
} from '@prisma/client';

type OrderWithRelations = PrismaOrder & {
  statusHistory?: PrismaOrderStatusHistory[];
  locationUpdates?: PrismaOrderLocation[];
};

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        deliveryOfferId: data.deliveryOfferId,
        transactionId: data.transactionId,
        clientId: data.clientId,
        transporterId: data.transporterId,
        status: PrismaOrderStatus.CONFIRMED,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: PrismaOrderStatus.CONFIRMED,
            notes: 'Order created after successful payment',
          },
        },
      },
      include: {
        statusHistory: true,
        locationUpdates: true,
      },
    });

    return this.mapToEntity(order);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async findByDeliveryOfferId(deliveryOfferId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { deliveryOfferId },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async findByTransactionId(transactionId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { transactionId },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async findByClientId(clientId: string, filters?: OrderFilters): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = { clientId };

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status as PrismaOrderStatus[] }
        : (filters.status as PrismaOrderStatus);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.mapToEntity(o));
  }

  async findByTransporterId(
    transporterId: string,
    filters?: OrderFilters,
  ): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = { transporterId };

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status as PrismaOrderStatus[] }
        : (filters.status as PrismaOrderStatus);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.mapToEntity(o));
  }

  async findActiveByTransporterId(transporterId: string): Promise<Order | null> {
    const activeStatuses: PrismaOrderStatus[] = [
      PrismaOrderStatus.CONFIRMED,
      PrismaOrderStatus.IN_PROGRESS,
      PrismaOrderStatus.PICKED_UP,
      PrismaOrderStatus.IN_TRANSIT,
    ];

    const order = await this.prisma.order.findFirst({
      where: {
        transporterId,
        status: { in: activeStatuses },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) return null;
    return this.mapToEntity(order);
  }

  async updateStatus(id: string, data: UpdateOrderStatusData): Promise<Order> {
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    const timestampField = this.getTimestampField(data.status);
    const updateData: Prisma.OrderUpdateInput = {
      status: data.status as PrismaOrderStatus,
      statusHistory: {
        create: {
          fromStatus: currentOrder?.status ?? null,
          toStatus: data.status as PrismaOrderStatus,
          notes: data.notes,
          changedBy: data.changedBy,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      },
    };

    if (timestampField) {
      updateData[timestampField] = new Date();
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    return this.mapToEntity(order);
  }

  async confirmDelivery(id: string, data: ConfirmDeliveryData): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        deliveryPhotoUrl: data.deliveryPhotoUrl,
        deliverySignature: data.deliverySignature,
        deliveryNotes: data.deliveryNotes,
        receiverName: data.receiverName,
        deliveredToAddress: data.deliveredToAddress,
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    return this.mapToEntity(order);
  }

  async cancelOrder(id: string, data: CancelOrderData): Promise<Order> {
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: PrismaOrderStatus.CANCELLED,
        cancellationReason: data.cancellationReason,
        cancelledBy: data.cancelledBy,
        cancelledAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: currentOrder?.status ?? null,
            toStatus: PrismaOrderStatus.CANCELLED,
            notes: data.cancellationReason,
            changedBy: data.cancelledBy,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    return this.mapToEntity(order);
  }

  async completeOrder(id: string): Promise<Order> {
    const currentOrder = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: PrismaOrderStatus.COMPLETED,
        completedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: currentOrder?.status ?? null,
            toStatus: PrismaOrderStatus.COMPLETED,
            notes: 'Order completed',
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        locationUpdates: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    return this.mapToEntity(order);
  }

  async addLocationUpdate(
    orderId: string,
    data: AddLocationData,
  ): Promise<OrderLocation> {
    const location = await this.prisma.orderLocation.create({
      data: {
        orderId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        accuracy: data.accuracy,
      },
    });

    return this.mapLocationToEntity(location);
  }

  async getLocationUpdates(
    orderId: string,
    limit: number = 100,
  ): Promise<OrderLocation[]> {
    const locations = await this.prisma.orderLocation.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return locations.map((l) => this.mapLocationToEntity(l));
  }

  async getLatestLocation(orderId: string): Promise<OrderLocation | null> {
    const location = await this.prisma.orderLocation.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (!location) return null;
    return this.mapLocationToEntity(location);
  }

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const history = await this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return history.map((h) => this.mapStatusHistoryToEntity(h));
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}-`;

    // Get the last order number for this year
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: { startsWith: prefix },
      },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async getNetEarnings(orderId: string): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryOffer: {
          select: { netEarnings: true },
        },
      },
    });

    if (!order || !order.deliveryOffer) {
      return 0;
    }

    return order.deliveryOffer.netEarnings;
  }

  private getTimestampField(status: OrderStatus): string | null {
    const mapping: Record<OrderStatus, string | null> = {
      [OrderStatus.CONFIRMED]: 'confirmedAt',
      [OrderStatus.IN_PROGRESS]: 'inProgressAt',
      [OrderStatus.PICKED_UP]: 'pickedUpAt',
      [OrderStatus.IN_TRANSIT]: 'inTransitAt',
      [OrderStatus.DELIVERED]: 'deliveredAt',
      [OrderStatus.COMPLETED]: 'completedAt',
      [OrderStatus.CANCELLED]: 'cancelledAt',
    };
    return mapping[status];
  }

  private mapToEntity(order: OrderWithRelations): Order {
    return new Order({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderStatus,
      confirmedAt: order.confirmedAt,
      inProgressAt: order.inProgressAt ?? undefined,
      pickedUpAt: order.pickedUpAt ?? undefined,
      inTransitAt: order.inTransitAt ?? undefined,
      deliveredAt: order.deliveredAt ?? undefined,
      completedAt: order.completedAt ?? undefined,
      cancelledAt: order.cancelledAt ?? undefined,
      deliveryPhotoUrl: order.deliveryPhotoUrl ?? undefined,
      deliverySignature: order.deliverySignature ?? undefined,
      deliveryNotes: order.deliveryNotes ?? undefined,
      receiverName: order.receiverName ?? undefined,
      deliveredToAddress: order.deliveredToAddress ?? undefined,
      cancellationReason: order.cancellationReason ?? undefined,
      cancelledBy: order.cancelledBy ?? undefined,
      deliveryOfferId: order.deliveryOfferId,
      transactionId: order.transactionId,
      clientId: order.clientId,
      transporterId: order.transporterId,
      statusHistory: order.statusHistory?.map((h) =>
        this.mapStatusHistoryToEntity(h),
      ),
      locationUpdates: order.locationUpdates?.map((l) =>
        this.mapLocationToEntity(l),
      ),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  private mapStatusHistoryToEntity(
    history: PrismaOrderStatusHistory,
  ): OrderStatusHistory {
    return new OrderStatusHistory({
      id: history.id,
      fromStatus: history.fromStatus as OrderStatus | null,
      toStatus: history.toStatus as OrderStatus,
      notes: history.notes ?? undefined,
      changedBy: history.changedBy ?? undefined,
      latitude: history.latitude ?? undefined,
      longitude: history.longitude ?? undefined,
      orderId: history.orderId,
      createdAt: history.createdAt,
    });
  }

  private mapLocationToEntity(location: PrismaOrderLocation): OrderLocation {
    return new OrderLocation({
      id: location.id,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed ?? undefined,
      heading: location.heading ?? undefined,
      accuracy: location.accuracy ?? undefined,
      orderId: location.orderId,
      createdAt: location.createdAt,
    });
  }
}
