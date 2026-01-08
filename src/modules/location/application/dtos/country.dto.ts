import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(2, 3)
  code: string;
}

export class UpdateCountryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @Length(2, 3)
  @IsOptional()
  code?: string;
}
