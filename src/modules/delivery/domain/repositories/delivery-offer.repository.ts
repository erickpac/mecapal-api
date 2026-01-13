import { DeliveryOffer } from '../entities/delivery-offer.entity';
import { DeliveryOfferStatus } from '../enums/delivery-offer-status.enum';

export interface CreateDeliveryOfferData {
  deliveryRequestId: string;
  vehicleId: string;
  offeredPrice: number;
  estimatedTimeMinutes: number;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  notes?: string;
  platformFeePercent: number;
  platformFee: number;
  netEarnings: number;
}

export interface FindDeliveryOffersOptions {
  status?: DeliveryOfferStatus;
  limit?: number;
  offset?: number;
}

export interface IDeliveryOfferRepository {
  create(
    transporterId: string,
    data: CreateDeliveryOfferData,
  ): Promise<DeliveryOffer>;
  findById(id: string): Promise<DeliveryOffer | null>;
  findByIdWithDetails(id: string): Promise<DeliveryOffer | null>;
  findByDeliveryRequestId(deliveryRequestId: string): Promise<DeliveryOffer[]>;
  findByTransporterId(
    transporterId: string,
    options?: FindDeliveryOffersOptions,
  ): Promise<DeliveryOffer[]>;
  existsByRequestAndTransporter(
    deliveryRequestId: string,
    transporterId: string,
  ): Promise<boolean>;
  update(
    id: string,
    data: Partial<CreateDeliveryOfferData>,
  ): Promise<DeliveryOffer>;
  updateStatus(id: string, status: DeliveryOfferStatus): Promise<DeliveryOffer>;
  updateManyStatus(
    deliveryRequestId: string,
    excludeOfferId: string,
    status: DeliveryOfferStatus,
  ): Promise<number>;
  delete(id: string): Promise<void>;
}
