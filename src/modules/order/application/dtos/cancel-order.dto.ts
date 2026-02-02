import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  cancellationReason: string;
}
