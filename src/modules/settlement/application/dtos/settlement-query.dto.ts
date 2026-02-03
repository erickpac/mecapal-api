import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SettlementStatus } from '../../domain/enums';

export class SettlementQueryDto {
  @IsOptional()
  @IsEnum(SettlementStatus)
  status?: SettlementStatus;

  @IsOptional()
  @IsUUID()
  transporterId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
