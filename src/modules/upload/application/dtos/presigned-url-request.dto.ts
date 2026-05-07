import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { FileCategory } from '../../domain/enums/file-category.enum';

export class PresignedUrlRequestDto {
  @IsEnum(FileCategory)
  category: FileCategory;

  /**
   * MIME type of the file. The server derives the storage extension
   * from this value (against an allowlist), so client-supplied
   * filenames cannot influence the resulting object key.
   */
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
