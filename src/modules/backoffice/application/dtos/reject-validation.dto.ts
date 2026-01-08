import { IsEnum, IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';
import { RejectionCategory } from '../../domain/enums/rejection-category.enum';

export class RejectValidationDto {
  @IsEnum(RejectionCategory)
  category: RejectionCategory;

  @IsString()
  @MinLength(50, { message: 'Rejection details must be at least 50 characters' })
  details: string;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean = true;
}
