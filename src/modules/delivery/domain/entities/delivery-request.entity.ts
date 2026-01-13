import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';
import { DeliveryRequestStatus } from '../enums/delivery-request-status.enum';
import { Address } from '../../../address/domain/entities/address.entity';
import { DeliveryOffer } from './delivery-offer.entity';

export class DeliveryRequest {
  id: string;

  // Load type
  loadType: LoadType;

  // Addresses
  pickupAddressId: string;
  pickupAddress?: Address;
  deliveryAddressId: string;
  deliveryAddress?: Address;
  calculatedDistanceKm: number;

  // Package details
  estimatedWeightKg: number;
  estimatedVolumeM3?: number;
  packageDescription: string;
  declaredValue?: number;
  isFragile: boolean;
  requiresSignature: boolean;
  specialInstructions?: string;

  // Scheduling
  pickupDate: Date;
  pickupTimeStart: Date;
  pickupTimeEnd: Date;
  deliveryDeadline: Date;
  offerWindowMinutes: number;
  offerExpiresAt: Date;

  // Status
  status: DeliveryRequestStatus;

  // Relations
  clientId: string;
  acceptedOfferId?: string;
  offers?: DeliveryOffer[];

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<DeliveryRequest>) {
    Object.assign(this, partial);
  }
}
