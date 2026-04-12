import {
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { IncidentStatus } from '../../domain/enums/incident-status.enum';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';

export class UpdateIncidentDto {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
