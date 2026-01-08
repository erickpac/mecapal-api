import {
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ZonePreferenceType } from '../../domain/entities/zone-preference.entity';

export class SetZonePreferenceDto {
  @IsUUID()
  zoneId: string;

  @IsEnum(ZonePreferenceType)
  preference: ZonePreferenceType;
}

export class BulkSetZonePreferencesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SetZonePreferenceDto)
  preferences: SetZonePreferenceDto[];
}
