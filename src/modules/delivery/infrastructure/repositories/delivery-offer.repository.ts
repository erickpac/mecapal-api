import { Injectable } from '@nestjs/common';
import { DeliveryOffer as PrismaDeliveryOffer, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IDeliveryOfferRepository,
  CreateDeliveryOfferData,
  FindDeliveryOffersOptions,
} from '../../domain/repositories/delivery-offer.repository';
import { DeliveryOffer } from '../../domain/entities/delivery-offer.entity';
import { DeliveryOfferStatus } from '../../domain/enums/delivery-offer-status.enum';
import { User } from '../../../cognito/domain/entities/user.entity';
import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';
import { VehicleType } from '../../../vehicle/domain/enums/vehicle-type.enum';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';
import { VehicleStatus } from '../../../vehicle/domain/enums/vehicle-status.enum';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';

type DeliveryOfferWithRelations = PrismaDeliveryOffer & {
  transporter?: Prisma.UserGetPayload<object>;
  vehicle?: Prisma.VehicleGetPayload<object>;
  deliveryRequest?: Prisma.DeliveryRequestGetPayload<{
    include: { pickupAddress: true; deliveryAddress: true };
  }>;
};

@Injectable()
export class DeliveryOfferRepository implements IDeliveryOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    transporterId: string,
    data: CreateDeliveryOfferData,
  ): Promise<DeliveryOffer> {
    const offer = await this.prisma.deliveryOffer.create({
      data: {
        ...data,
        transporterId,
      },
      include: {
        transporter: true,
        vehicle: true,
      },
    });

    return this.mapToEntity(offer);
  }

  async findById(id: string): Promise<DeliveryOffer | null> {
    const offer = await this.prisma.deliveryOffer.findUnique({
      where: { id },
    });

    if (!offer) return null;

    return this.mapToEntity(offer);
  }

  async findByIdWithDetails(id: string): Promise<DeliveryOffer | null> {
    const offer = await this.prisma.deliveryOffer.findUnique({
      where: { id },
      include: {
        transporter: true,
        vehicle: true,
        deliveryRequest: {
          include: {
            pickupAddress: true,
            deliveryAddress: true,
          },
        },
      },
    });

    if (!offer) return null;

    return this.mapToEntity(offer);
  }

  async findByDeliveryRequestId(
    deliveryRequestId: string,
  ): Promise<DeliveryOffer[]> {
    const offers = await this.prisma.deliveryOffer.findMany({
      where: { deliveryRequestId },
      include: {
        transporter: true,
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers.map((offer) => this.mapToEntity(offer));
  }

  async findByTransporterId(
    transporterId: string,
    options?: FindDeliveryOffersOptions,
  ): Promise<DeliveryOffer[]> {
    const where: Prisma.DeliveryOfferWhereInput = { transporterId };

    if (options?.status) {
      where.status = options.status;
    }

    const offers = await this.prisma.deliveryOffer.findMany({
      where,
      include: {
        transporter: true,
        vehicle: true,
        deliveryRequest: {
          include: {
            pickupAddress: true,
            deliveryAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return offers.map((offer) => this.mapToEntity(offer));
  }

  async existsByRequestAndTransporter(
    deliveryRequestId: string,
    transporterId: string,
  ): Promise<boolean> {
    const count = await this.prisma.deliveryOffer.count({
      where: {
        deliveryRequestId,
        transporterId,
      },
    });
    return count > 0;
  }

  async update(
    id: string,
    data: Partial<CreateDeliveryOfferData>,
  ): Promise<DeliveryOffer> {
    const offer = await this.prisma.deliveryOffer.update({
      where: { id },
      data,
    });

    return this.mapToEntity(offer);
  }

  async updateStatus(
    id: string,
    status: DeliveryOfferStatus,
  ): Promise<DeliveryOffer> {
    const offer = await this.prisma.deliveryOffer.update({
      where: { id },
      data: { status },
    });

    return this.mapToEntity(offer);
  }

  async updateManyStatus(
    deliveryRequestId: string,
    excludeOfferId: string,
    status: DeliveryOfferStatus,
  ): Promise<number> {
    const result = await this.prisma.deliveryOffer.updateMany({
      where: {
        deliveryRequestId,
        id: { not: excludeOfferId },
        status: DeliveryOfferStatus.PENDING,
      },
      data: { status },
    });

    return result.count;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryOffer.delete({
      where: { id },
    });
  }

  private mapToEntity(offer: DeliveryOfferWithRelations): DeliveryOffer {
    return new DeliveryOffer({
      id: offer.id,
      offeredPrice: offer.offeredPrice,
      estimatedTimeMinutes: offer.estimatedTimeMinutes,
      estimatedPickupTime: offer.estimatedPickupTime,
      estimatedDeliveryTime: offer.estimatedDeliveryTime,
      notes: offer.notes ?? undefined,

      // Commission details
      commissionType: offer.commissionType,
      commissionPercent: offer.commissionPercent,
      commissionFixedAmount: offer.commissionFixedAmount,
      commissionMinimum: offer.commissionMinimum,
      commissionMaximum: offer.commissionMaximum,
      commissionAmount: offer.commissionAmount,
      commissionExempt: offer.commissionExempt,

      // Tax details
      taxPercent: offer.taxPercent,
      taxAmount: offer.taxAmount,
      taxExempt: offer.taxExempt,

      // Final prices
      subtotal: offer.subtotal,
      totalClientPrice: offer.totalClientPrice,
      netEarnings: offer.netEarnings,

      status: offer.status as DeliveryOfferStatus,
      deliveryRequestId: offer.deliveryRequestId,
      transporterId: offer.transporterId,
      transporter: offer.transporter
        ? new User({
            ...offer.transporter,
            role: offer.transporter.role as UserRole,
          })
        : undefined,
      vehicleId: offer.vehicleId,
      vehicle: offer.vehicle
        ? new Vehicle({
            ...offer.vehicle,
            vehicleType: offer.vehicle.vehicleType as VehicleType,
            loadType: offer.vehicle.loadType as LoadType,
            status: offer.vehicle.status as VehicleStatus,
          })
        : undefined,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    });
  }
}
