import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(10)
  code: string;

  @IsUUID()
  countryId: string;
}

export class UpdateStateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  code?: string;
}
