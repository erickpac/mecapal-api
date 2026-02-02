import { CommissionType } from '@prisma/client';
import { DeliveryOfferStatus } from '../enums/delivery-offer-status.enum';
import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';
import { User } from '../../../cognito/domain/entities/user.entity';
import type { DeliveryRequest } from './delivery-request.entity';

export class DeliveryOffer {
  id: string;

  // Offer details
  offeredPrice: number;
  estimatedTimeMinutes: number;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  notes?: string;

  // Commission details
  commissionType: CommissionType;
  commissionPercent?: number | null;
  commissionFixedAmount?: number | null;
  commissionMinimum?: number | null;
  commissionMaximum?: number | null;
  commissionAmount: number;
  commissionExempt: boolean;

  // Tax details
  taxPercent: number;
  taxAmount: number;
  taxExempt: boolean;

  // Final prices
  subtotal: number;
  totalClientPrice: number;
  netEarnings: number;

  // Status
  status: DeliveryOfferStatus;

  // Relations
  deliveryRequestId: string;
  deliveryRequest?: DeliveryRequest;
  transporterId: string;
  transporter?: User;
  vehicleId: string;
  vehicle?: Vehicle;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<DeliveryOffer>) {
    Object.assign(this, partial);
  }
}
