import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class RecordPaymentDto {
  @IsDateString()
  @IsNotEmpty()
  transferDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  transactionNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsUrl()
  screenshotUrl?: string;

  @IsOptional()
  @IsUUID()
  bankAccountId?: string;
}
