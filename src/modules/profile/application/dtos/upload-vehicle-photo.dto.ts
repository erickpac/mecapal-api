import { IsBoolean, IsString } from 'class-validator';

export class UploadVehiclePhotoDto {
  @IsString()
  url: string;

  @IsBoolean()
  isMain: boolean;
}
