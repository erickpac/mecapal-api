import { TransporterStatus } from '../enums/transporter-status.enum';

export class TransporterProfile {
  id: string;
  userId: string;

  // License
  licenseNumber: string;
  licenseExpiration: Date;
  licenseFrontPhotoUrl: string;
  licenseBackPhotoUrl: string;
  idPhotoUrl: string;

  // Address
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Insurance
  insurancePolicy: string;
  insuranceExpiration: Date;
  insuranceDocumentUrl: string;

  status: TransporterStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TransporterProfile>) {
    Object.assign(this, partial);
  }
}
