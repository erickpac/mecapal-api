import { IsOptional, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../../domain/enums';

export class OrderQueryDto {
  @IsOptional()
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  @Transform(({ value }: { value: OrderStatus | OrderStatus[] }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  status?: OrderStatus[];
}
