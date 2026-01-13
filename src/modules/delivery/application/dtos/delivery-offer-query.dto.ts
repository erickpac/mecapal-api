import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryOfferStatus } from '../../domain/enums/delivery-offer-status.enum';

export class DeliveryOfferQueryDto {
  @IsEnum(DeliveryOfferStatus)
  @IsOptional()
  status?: DeliveryOfferStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0;
}
