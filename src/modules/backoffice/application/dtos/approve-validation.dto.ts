import { IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ValidationChecklistDto {
  @IsBoolean()
  photosAreClear: boolean;

  @IsBoolean()
  licensePlateVisible: boolean;

  @IsBoolean()
  vinMatchesDocuments: boolean;

  @IsBoolean()
  insuranceValidMoreThan30Days: boolean;

  @IsBoolean()
  documentsNotAltered: boolean;

  @IsBoolean()
  informationIsConsistent: boolean;
}

export class ApproveValidationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ValidationChecklistDto)
  checklist: ValidationChecklistDto;
}
