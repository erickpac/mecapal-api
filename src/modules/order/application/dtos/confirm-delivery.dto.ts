import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class ConfirmDeliveryDto {
  @IsOptional()
  @IsUrl()
  deliveryPhotoUrl?: string;

  @IsOptional()
  @IsString()
  deliverySignature?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receiverName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  deliveredToAddress?: string;
}
