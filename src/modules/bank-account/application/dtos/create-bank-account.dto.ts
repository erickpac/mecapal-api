import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { BankAccountType } from '../../domain/enums';

export class CreateBankAccountDto {
  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsString()
  @MaxLength(150)
  accountHolderName: string;

  @IsEnum(BankAccountType)
  accountType: BankAccountType;

  @IsString()
  @MinLength(4, { message: 'Account number must be at least 4 characters' })
  @MaxLength(30, { message: 'Account number must be at most 30 characters' })
  @Matches(/^[\d-]+$/, {
    message: 'Account number can only contain digits and hyphens',
  })
  accountNumber: string;

  @IsOptional()
  @IsUrl()
  verificationDocUrl?: string;
}
