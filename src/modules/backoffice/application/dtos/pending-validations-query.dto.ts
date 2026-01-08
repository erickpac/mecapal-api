import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';

export class PendingValidationsQueryDto {
  @IsEnum(ValidationEntityType)
  @IsOptional()
  type?: ValidationEntityType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(['recent', 'oldest', 'priority'])
  @IsOptional()
  sort?: 'recent' | 'oldest' | 'priority';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
