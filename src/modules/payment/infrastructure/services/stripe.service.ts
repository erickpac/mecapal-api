import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  IStripeService,
  CreatePaymentIntentParams,
  AttachPaymentMethodParams,
} from '../../domain/interfaces/stripe.service';

@Injectable()
export class StripeService implements IStripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  private webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY not set — payment endpoints will be unavailable',
      );
    }
    this.webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
      '',
    );
  }

  private getClient(): Stripe {
    if (!this.stripe) {
      throw new Error(
        'Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.',
      );
    }
    return this.stripe;
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return this.getClient().customers.create({
      email,
      name,
    });
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.getClient().customers.retrieve(customerId);
      if (customer.deleted) return null;
      return customer as Stripe.Customer;
    } catch {
      return null;
    }
  }

  async attachPaymentMethod(
    params: AttachPaymentMethodParams,
  ): Promise<Stripe.PaymentMethod> {
    return this.getClient().paymentMethods.attach(params.paymentMethodId, {
      customer: params.customerId,
    });
  }

  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.getClient().paymentMethods.detach(paymentMethodId);
  }

  async getPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod | null> {
    try {
      return await this.getClient().paymentMethods.retrieve(paymentMethodId);
    } catch {
      return null;
    }
  }

  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    const result = await this.getClient().paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return result.data;
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<Stripe.PaymentIntent> {
    return this.getClient().paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      metadata: params.metadata,
      description: params.description,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    const params: Stripe.PaymentIntentConfirmParams = {};
    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
    }
    return this.getClient().paymentIntents.confirm(paymentIntentId, params);
  }

  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.getClient().paymentIntents.cancel(paymentIntentId);
  }

  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      return await this.getClient().paymentIntents.retrieve(paymentIntentId);
    } catch {
      return null;
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    if (amount) {
      params.amount = amount;
    }
    return this.getClient().refunds.create(params);
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.getClient().webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }
}
