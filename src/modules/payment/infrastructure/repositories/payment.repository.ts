import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IPaymentRepository,
  CreatePaymentMethodData,
  CreateTransactionData,
  UpdateTransactionData,
} from '../../domain/interfaces/payment.repository';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  PaymentMethodType,
  CardBrand,
  TransactionStatus,
  TransactionType,
} from '../../domain/enums';
import {
  PaymentMethod as PrismaPaymentMethod,
  Transaction as PrismaTransaction,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Payment Methods ====================

  async createPaymentMethod(
    userId: string,
    data: CreatePaymentMethodData,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        ...data,
        userId,
      },
    });
    return this.mapPaymentMethodToEntity(paymentMethod);
  }

  async findPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!paymentMethod) return null;
    return this.mapPaymentMethodToEntity(paymentMethod);
  }

  async findPaymentMethodsByUserId(userId: string): Promise<PaymentMethod[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return paymentMethods.map((pm) => this.mapPaymentMethodToEntity(pm));
  }

  async findDefaultPaymentMethod(
    userId: string,
  ): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId, isDefault: true },
    });
    if (!paymentMethod) return null;
    return this.mapPaymentMethodToEntity(paymentMethod);
  }

  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      // Remove default from all user's payment methods
      this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      // Set new default
      this.prisma.paymentMethod.update({
        where: { id: paymentMethodId },
        data: { isDefault: true },
      }),
    ]);
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  // ==================== Transactions ====================

  async createTransaction(
    userId: string,
    data: CreateTransactionData,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        stripePaymentIntentId: data.stripePaymentIntentId,
        stripeChargeId: data.stripeChargeId,
        amount: data.amount,
        currency: data.currency || 'USD',
        subtotal: data.subtotal,
        commissionAmount: data.commissionAmount,
        taxAmount: data.taxAmount,
        paymentMethodId: data.paymentMethodId,
        deliveryOfferId: data.deliveryOfferId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        userId,
      },
      include: {
        paymentMethod: true,
      },
    });
    return this.mapTransactionToEntity(transaction);
  }

  async findTransactionById(id: string): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { paymentMethod: true },
    });
    if (!transaction) return null;
    return this.mapTransactionToEntity(transaction);
  }

  async findTransactionByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { paymentMethod: true },
    });
    if (!transaction) return null;
    return this.mapTransactionToEntity(transaction);
  }

  async findTransactionByDeliveryOfferId(
    deliveryOfferId: string,
  ): Promise<Transaction | null> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { deliveryOfferId },
      include: { paymentMethod: true },
    });
    if (!transaction) return null;
    return this.mapTransactionToEntity(transaction);
  }

  async findTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: { paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });
    return transactions.map((t) => this.mapTransactionToEntity(t));
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionData,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data,
      include: { paymentMethod: true },
    });
    return this.mapTransactionToEntity(transaction);
  }

  // ==================== User Stripe Customer ====================

  async getOrCreateStripeCustomerId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    return user?.stripeCustomerId || '';
  }

  async updateStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  // ==================== Mappers ====================

  private mapPaymentMethodToEntity(pm: PrismaPaymentMethod): PaymentMethod {
    return new PaymentMethod({
      id: pm.id,
      stripePaymentMethodId: pm.stripePaymentMethodId,
      stripeCustomerId: pm.stripeCustomerId,
      type: pm.type as PaymentMethodType,
      cardBrand: pm.cardBrand as CardBrand,
      cardLast4: pm.cardLast4,
      cardExpMonth: pm.cardExpMonth,
      cardExpYear: pm.cardExpYear,
      isDefault: pm.isDefault,
      userId: pm.userId,
      createdAt: pm.createdAt,
      updatedAt: pm.updatedAt,
    });
  }

  private mapTransactionToEntity(
    t: PrismaTransaction & { paymentMethod?: PrismaPaymentMethod | null },
  ): Transaction {
    return new Transaction({
      id: t.id,
      stripePaymentIntentId: t.stripePaymentIntentId,
      stripeChargeId: t.stripeChargeId ?? undefined,
      type: t.type as TransactionType,
      status: t.status as TransactionStatus,
      amount: t.amount,
      currency: t.currency,
      subtotal: t.subtotal,
      commissionAmount: t.commissionAmount,
      taxAmount: t.taxAmount,
      refundedAmount: t.refundedAmount,
      failureCode: t.failureCode ?? undefined,
      failureMessage: t.failureMessage ?? undefined,
      userId: t.userId,
      paymentMethodId: t.paymentMethodId ?? undefined,
      paymentMethod: t.paymentMethod
        ? this.mapPaymentMethodToEntity(t.paymentMethod)
        : undefined,
      deliveryOfferId: t.deliveryOfferId,
      metadata: t.metadata as Record<string, unknown> | undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    });
  }
}
