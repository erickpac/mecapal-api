import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  accountHolderName?: string;

  @IsOptional()
  @IsUrl()
  verificationDocUrl?: string;
}
