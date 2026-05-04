import { TransporterProfile } from '../entities/transporter-profile.entity';

export interface CreateTransporterProfileData {
  licenseNumber: string;
  licenseExpiration: Date;
  licenseFrontPhotoUrl: string;
  licenseBackPhotoUrl: string;
  idPhotoUrl: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  insurancePolicy: string;
  insuranceExpiration: Date;
  insuranceDocumentUrl: string;
  idNumber?: string | null;
}

export type UpdateTransporterProfileData =
  Partial<CreateTransporterProfileData>;

export interface ITransporterProfileRepository {
  create(
    userId: string,
    data: CreateTransporterProfileData,
  ): Promise<TransporterProfile>;
  findByUserId(userId: string): Promise<TransporterProfile | null>;
  update(
    userId: string,
    data: UpdateTransporterProfileData,
  ): Promise<TransporterProfile>;
}
