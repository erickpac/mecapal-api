import { DeletionReason } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RequestAccountDeletionDto {
  @IsString()
  @MinLength(1)
  password: string;

  @IsOptional()
  @IsEnum(DeletionReason)
  reason?: DeletionReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  otherReason?: string;
}
