import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BankAccountStatus } from '../../domain/enums';

export class VerifyBankAccountDto {
  @IsEnum(BankAccountStatus)
  status: BankAccountStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
