import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateDeliveryOfferDto {
  @IsUUID()
  vehicleId: string;

  @IsNumber()
  @Min(3)
  offeredPrice: number;

  @IsInt()
  @Min(30)
  @Max(480)
  estimatedTimeMinutes: number;

  @IsDateString()
  estimatedPickupTime: string;

  @IsDateString()
  estimatedDeliveryTime: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
