import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { IncidentResolution } from '../../domain/enums/incident-resolution.enum';
import { UserAction } from '../../domain/enums/user-action.enum';

export class ResolveIncidentDto {
  @IsEnum(IncidentResolution)
  resolution: IncidentResolution;

  @IsString()
  @MinLength(100)
  @MaxLength(2000)
  resolutionNotes: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsEnum(UserAction)
  userAction?: UserAction;
}
