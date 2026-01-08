import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendEmailDto {
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value : [value],
  )
  @IsEmail({}, { each: true })
  to: string | string[];

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsEmail()
  @IsOptional()
  replyTo?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];
}
