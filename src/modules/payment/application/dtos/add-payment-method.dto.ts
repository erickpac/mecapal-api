import { IsNotEmpty, IsString } from 'class-validator';

export class AddPaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string; // Stripe PaymentMethod ID from frontend (via Stripe Elements)
}
