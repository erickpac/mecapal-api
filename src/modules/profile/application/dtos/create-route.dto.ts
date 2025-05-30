import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';
import { Location } from '../../domain/entities/route.entity';

export class CreateRouteDto {
  @IsObject()
  origin: Location;

  @IsObject()
  destination: Location;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}
