import { PaymentMethodType } from '../enums/payment-method-type.enum';
import { CardBrand } from '../enums/card-brand.enum';

export class PaymentMethod {
  id: string;
  stripePaymentMethodId: string;
  stripeCustomerId: string;
  type: PaymentMethodType;
  cardBrand: CardBrand;
  cardLast4: string;
  cardExpMonth: number;
  cardExpYear: number;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PaymentMethod>) {
    Object.assign(this, partial);
  }

  get displayName(): string {
    return `${this.cardBrand} ****${this.cardLast4}`;
  }

  get expirationDate(): string {
    const month = this.cardExpMonth.toString().padStart(2, '0');
    const year = this.cardExpYear.toString().slice(-2);
    return `${month}/${year}`;
  }

  get isExpired(): boolean {
    const now = new Date();
    const expDate = new Date(this.cardExpYear, this.cardExpMonth, 0);
    return now > expDate;
  }
}
