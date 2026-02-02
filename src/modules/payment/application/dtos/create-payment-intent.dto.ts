import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryOfferId: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string; // Optional: use specific payment method or default
}
