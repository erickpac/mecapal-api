import { IsEnum, IsString, IsNotEmpty, Matches } from 'class-validator';
import { FileCategory } from '../../domain/enums/file-category.enum';

export class PresignedUrlRequestDto {
  @IsEnum(FileCategory)
  category: FileCategory;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\w\-. ]+$/, {
    message: 'Filename contains invalid characters',
  })
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
