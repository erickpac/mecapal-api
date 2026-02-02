import Stripe from 'stripe';

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface AttachPaymentMethodParams {
  paymentMethodId: string;
  customerId: string;
}

export interface IStripeService {
  // Customers
  createCustomer(email: string, name: string): Promise<Stripe.Customer>;
  getCustomer(customerId: string): Promise<Stripe.Customer | null>;

  // Payment Methods
  attachPaymentMethod(
    params: AttachPaymentMethodParams,
  ): Promise<Stripe.PaymentMethod>;
  detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
  getPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod | null>;
  listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;

  // Payment Intents
  createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<Stripe.PaymentIntent>;
  confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent>;
  cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
  getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent | null>;

  // Refunds
  createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund>;

  // Webhooks
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
}
