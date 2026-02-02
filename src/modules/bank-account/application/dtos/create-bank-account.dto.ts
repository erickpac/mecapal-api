import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  Length,
  Matches,
  MaxLength,
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
  @Length(9, 9, { message: 'Routing number must be exactly 9 digits' })
  @Matches(/^\d{9}$/, { message: 'Routing number must contain only digits' })
  routingNumber: string;

  @IsString()
  @Length(4, 17, { message: 'Account number must be between 4 and 17 digits' })
  @Matches(/^\d+$/, { message: 'Account number must contain only digits' })
  accountNumber: string;

  @IsOptional()
  @IsUrl()
  verificationDocUrl?: string;
}
