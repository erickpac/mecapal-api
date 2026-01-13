import { DeliveryOfferStatus } from '../enums/delivery-offer-status.enum';
import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';
import { User } from '../../../cognito/domain/entities/user.entity';

export class DeliveryOffer {
  id: string;

  // Offer details
  offeredPrice: number;
  estimatedTimeMinutes: number;
  estimatedPickupTime: Date;
  estimatedDeliveryTime: Date;
  notes?: string;

  // Platform fee (15%)
  platformFeePercent: number;
  platformFee: number;
  netEarnings: number;

  // Status
  status: DeliveryOfferStatus;

  // Relations
  deliveryRequestId: string;
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
