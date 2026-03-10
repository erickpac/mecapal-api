import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';

export class ListUsersQueryDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(['recent', 'oldest'])
  @IsOptional()
  sort?: 'recent' | 'oldest';

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
