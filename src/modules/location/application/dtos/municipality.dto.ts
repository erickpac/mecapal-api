import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateMunicipalityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(10)
  code: string;

  @IsUUID()
  stateId: string;
}

export class UpdateMunicipalityDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  code?: string;
}
