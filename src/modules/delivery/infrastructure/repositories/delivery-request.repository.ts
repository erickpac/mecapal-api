import { Injectable } from '@nestjs/common';
import {
  DeliveryRequest as PrismaDeliveryRequest,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IDeliveryRequestRepository,
  CreateDeliveryRequestData,
  UpdateDeliveryRequestData,
  FindDeliveryRequestsOptions,
} from '../../domain/repositories/delivery-request.repository';
import { DeliveryRequest } from '../../domain/entities/delivery-request.entity';
import { DeliveryOffer } from '../../domain/entities/delivery-offer.entity';
import { DeliveryRequestStatus } from '../../domain/enums/delivery-request-status.enum';
import { DeliveryOfferStatus } from '../../domain/enums/delivery-offer-status.enum';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';
import { VehicleType } from '../../../vehicle/domain/enums/vehicle-type.enum';
import { VehicleStatus } from '../../../vehicle/domain/enums/vehicle-status.enum';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { Address } from '../../../address/domain/entities/address.entity';
import { User } from '../../../cognito/domain/entities/user.entity';
import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';

type DeliveryRequestWithAddresses = PrismaDeliveryRequest & {
  pickupAddress?: Prisma.AddressGetPayload<object>;
  deliveryAddress?: Prisma.AddressGetPayload<object>;
  offers?: Array<
    Prisma.DeliveryOfferGetPayload<{
      include: { transporter: true; vehicle: true };
    }>
  >;
};

@Injectable()
export class DeliveryRequestRepository implements IDeliveryRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    clientId: string,
    data: CreateDeliveryRequestData,
  ): Promise<DeliveryRequest> {
    const request = await this.prisma.deliveryRequest.create({
      data: {
        ...data,
        clientId,
      },
    });

    return this.mapToEntity(request);
  }

  async findById(id: string): Promise<DeliveryRequest | null> {
    const request = await this.prisma.deliveryRequest.findUnique({
      where: { id },
    });

    if (!request) return null;

    return this.mapToEntity(request);
  }

  async findByIdWithDetails(id: string): Promise<DeliveryRequest | null> {
    const request = await this.prisma.deliveryRequest.findUnique({
      where: { id },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        offers: {
          include: {
            transporter: true,
            vehicle: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) return null;

    return this.mapToEntity(request);
  }

  async findByClientId(
    clientId: string,
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]> {
    const where: Prisma.DeliveryRequestWhereInput = { clientId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.loadType) {
      where.loadType = options.loadType;
    }

    const requests = await this.prisma.deliveryRequest.findMany({
      where,
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return requests.map((request) => this.mapToEntity(request));
  }

  async findAvailable(
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]> {
    const where: Prisma.DeliveryRequestWhereInput = {
      status: {
        in: [
          DeliveryRequestStatus.PUBLISHED,
          DeliveryRequestStatus.OFFERS_RECEIVED,
        ],
      },
      offerExpiresAt: {
        gt: new Date(),
      },
    };

    if (options?.loadType) {
      where.loadType = options.loadType;
    }

    const requests = await this.prisma.deliveryRequest.findMany({
      where,
      include: {
        pickupAddress: true,
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return requests.map((request) => this.mapToEntity(request));
  }

  async countByClientId(clientId: string): Promise<number> {
    return this.prisma.deliveryRequest.count({
      where: { clientId },
    });
  }

  async update(
    id: string,
    data: UpdateDeliveryRequestData,
  ): Promise<DeliveryRequest> {
    const request = await this.prisma.deliveryRequest.update({
      where: { id },
      data,
    });

    return this.mapToEntity(request);
  }

  async updateStatus(
    id: string,
    status: DeliveryRequestStatus,
  ): Promise<DeliveryRequest> {
    const request = await this.prisma.deliveryRequest.update({
      where: { id },
      data: { status },
    });

    return this.mapToEntity(request);
  }

  async setAcceptedOffer(
    id: string,
    offerId: string,
  ): Promise<DeliveryRequest> {
    const request = await this.prisma.deliveryRequest.update({
      where: { id },
      data: { acceptedOfferId: offerId },
    });

    return this.mapToEntity(request);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryRequest.delete({
      where: { id },
    });
  }

  private mapToEntity(request: DeliveryRequestWithAddresses): DeliveryRequest {
    return new DeliveryRequest({
      id: request.id,
      loadType: request.loadType as LoadType,
      pickupAddressId: request.pickupAddressId,
      pickupAddress: request.pickupAddress
        ? new Address(request.pickupAddress)
        : undefined,
      deliveryAddressId: request.deliveryAddressId,
      deliveryAddress: request.deliveryAddress
        ? new Address(request.deliveryAddress)
        : undefined,
      calculatedDistanceKm: request.calculatedDistanceKm,
      estimatedWeightKg: request.estimatedWeightKg,
      estimatedVolumeM3: request.estimatedVolumeM3 ?? undefined,
      packageDescription: request.packageDescription,
      declaredValue: request.declaredValue ?? undefined,
      isFragile: request.isFragile,
      requiresSignature: request.requiresSignature,
      specialInstructions: request.specialInstructions ?? undefined,
      pickupDate: request.pickupDate,
      pickupTimeStart: request.pickupTimeStart,
      pickupTimeEnd: request.pickupTimeEnd,
      deliveryDeadline: request.deliveryDeadline,
      offerWindowMinutes: request.offerWindowMinutes,
      offerExpiresAt: request.offerExpiresAt,
      status: request.status as DeliveryRequestStatus,
      clientId: request.clientId,
      acceptedOfferId: request.acceptedOfferId ?? undefined,
      offers: request.offers?.map(
        (offer) =>
          new DeliveryOffer({
            id: offer.id,
            offeredPrice: offer.offeredPrice,
            estimatedTimeMinutes: offer.estimatedTimeMinutes,
            estimatedPickupTime: offer.estimatedPickupTime,
            estimatedDeliveryTime: offer.estimatedDeliveryTime,
            notes: offer.notes ?? undefined,
            platformFeePercent: offer.platformFeePercent,
            platformFee: offer.platformFee,
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
          }),
      ),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  }
}
