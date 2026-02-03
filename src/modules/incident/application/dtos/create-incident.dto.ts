import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IncidentType } from '../../domain/enums/incident-type.enum';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type: IncidentType;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];

  @IsUUID()
  reportedAgainstId: string;

  @IsUUID()
  orderId: string;
}
