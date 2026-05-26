import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  // ISO 3166 country code (defaults to 'GT' when omitted)
  // Transformed to uppercase so the FK to Country.code (uppercase) holds.
  @Transform(({ value }: { value: string | undefined }) => value?.toUpperCase())
  @IsString()
  @Length(2, 3)
  @IsOptional()
  country?: string;

  // Insurance
  @IsString()
  insurancePolicy: string;

  @IsDateString()
  insuranceExpiration: string;

  @IsUrl()
  insuranceDocumentUrl: string;
}
