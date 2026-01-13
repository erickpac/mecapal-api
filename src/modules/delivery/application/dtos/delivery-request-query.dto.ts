import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryRequestStatus } from '../../domain/enums/delivery-request-status.enum';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';

export class DeliveryRequestQueryDto {
  @IsEnum(DeliveryRequestStatus)
  @IsOptional()
  status?: DeliveryRequestStatus;

  @IsEnum(LoadType)
  @IsOptional()
  loadType?: LoadType;

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
