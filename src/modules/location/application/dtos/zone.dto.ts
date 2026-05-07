import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PolygonDto {
  @IsString()
  type: 'Polygon';

  @IsNotEmpty()
  coordinates: number[][][];
}

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(10)
  postalCode: string;

  @IsUUID()
  municipalityId: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PolygonDto)
  @IsOptional()
  polygon?: PolygonDto;
}

export class UpdateZoneDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PolygonDto)
  @IsOptional()
  polygon?: PolygonDto;
}
