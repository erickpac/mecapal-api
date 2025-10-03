import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoveryPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
