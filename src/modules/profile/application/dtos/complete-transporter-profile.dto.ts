import { IsDateString, IsString, IsUrl } from 'class-validator';

export class CompleteTransporterProfileDto {
  // License
  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiration: string;

  @IsUrl()
  licenseFrontPhotoUrl: string;

  @IsUrl()
  licenseBackPhotoUrl: string;

  @IsUrl()
  idPhotoUrl: string;

  // Address
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  // Insurance
  @IsString()
  insurancePolicy: string;

  @IsDateString()
  insuranceExpiration: string;

  @IsUrl()
  insuranceDocumentUrl: string;
}
