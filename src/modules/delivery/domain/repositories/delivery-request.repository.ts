import { DeliveryRequest } from '../entities/delivery-request.entity';
import { DeliveryRequestStatus } from '../enums/delivery-request-status.enum';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';

export interface CreateDeliveryRequestData {
  loadType: LoadType;
  pickupAddressId: string;
  deliveryAddressId: string;
  calculatedDistanceKm: number;
  estimatedWeightKg: number;
  estimatedVolumeM3?: number;
  packageDescription: string;
  declaredValue?: number;
  isFragile: boolean;
  requiresSignature: boolean;
  specialInstructions?: string;
  pickupDate: Date;
  pickupTimeStart: Date;
  pickupTimeEnd: Date;
  deliveryDeadline: Date;
  offerWindowMinutes: number;
  offerExpiresAt: Date;
}

export type UpdateDeliveryRequestData = Partial<
  Omit<CreateDeliveryRequestData, 'pickupAddressId' | 'deliveryAddressId'>
>;

export interface FindDeliveryRequestsOptions {
  status?: DeliveryRequestStatus;
  loadType?: LoadType;
  limit?: number;
  offset?: number;
}

export interface IDeliveryRequestRepository {
  create(
    clientId: string,
    data: CreateDeliveryRequestData,
  ): Promise<DeliveryRequest>;
  findById(id: string): Promise<DeliveryRequest | null>;
  findByIdWithDetails(id: string): Promise<DeliveryRequest | null>;
  findByClientId(
    clientId: string,
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]>;
  findAvailable(
    options?: FindDeliveryRequestsOptions,
  ): Promise<DeliveryRequest[]>;
  findExpired(): Promise<DeliveryRequest[]>;
  countByClientId(clientId: string): Promise<number>;
  update(id: string, data: UpdateDeliveryRequestData): Promise<DeliveryRequest>;
  updateStatus(
    id: string,
    status: DeliveryRequestStatus,
  ): Promise<DeliveryRequest>;
  setAcceptedOffer(id: string, offerId: string): Promise<DeliveryRequest>;
  delete(id: string): Promise<void>;
}
