import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ISettlementRepository,
  CreateSettlementData,
  RecordPaymentData,
  SettlementFilters,
} from '../../domain/interfaces';
import { Settlement } from '../../domain/entities';
import { SettlementStatus } from '../../domain/enums';
import {
  Settlement as PrismaSettlement,
  SettlementStatus as PrismaSettlementStatus,
} from '@prisma/client';

@Injectable()
export class SettlementRepository implements ISettlementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSettlementData): Promise<Settlement> {
    const settlement = await this.prisma.settlement.create({
      data: {
        orderId: data.orderId,
        transporterId: data.transporterId,
        amount: data.amount,
        status: PrismaSettlementStatus.PENDING,
      },
    });

    return this.mapToEntity(settlement);
  }

  async findById(id: string): Promise<Settlement | null> {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id },
    });

    if (!settlement) return null;
    return this.mapToEntity(settlement);
  }

  async findByOrderId(orderId: string): Promise<Settlement | null> {
    const settlement = await this.prisma.settlement.findUnique({
      where: { orderId },
    });

    if (!settlement) return null;
    return this.mapToEntity(settlement);
  }

  async findByTransporterId(transporterId: string): Promise<Settlement[]> {
    const settlements = await this.prisma.settlement.findMany({
      where: { transporterId },
      orderBy: { createdAt: 'desc' },
    });

    return settlements.map((s) => this.mapToEntity(s));
  }

  async findPending(): Promise<Settlement[]> {
    const settlements = await this.prisma.settlement.findMany({
      where: { status: PrismaSettlementStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    return settlements.map((s) => this.mapToEntity(s));
  }

  async findByFilters(filters: SettlementFilters): Promise<Settlement[]> {
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status as PrismaSettlementStatus;
    }

    if (filters.transporterId) {
      where.transporterId = filters.transporterId;
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        (where.createdAt as Record<string, Date>).gte = filters.fromDate;
      }
      if (filters.toDate) {
        (where.createdAt as Record<string, Date>).lte = filters.toDate;
      }
    }

    const settlements = await this.prisma.settlement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return settlements.map((s) => this.mapToEntity(s));
  }

  async recordPayment(id: string, data: RecordPaymentData): Promise<Settlement> {
    const settlement = await this.prisma.settlement.update({
      where: { id },
      data: {
        status: PrismaSettlementStatus.PAID,
        transferDate: data.transferDate,
        transactionNumber: data.transactionNumber,
        comment: data.comment,
        screenshotUrl: data.screenshotUrl,
        bankAccountId: data.bankAccountId,
        registeredBy: data.registeredBy,
        paidAt: new Date(),
      },
    });

    return this.mapToEntity(settlement);
  }

  async existsByOrderId(orderId: string): Promise<boolean> {
    const count = await this.prisma.settlement.count({
      where: { orderId },
    });
    return count > 0;
  }

  async getTotalPendingByTransporterId(transporterId: string): Promise<number> {
    const result = await this.prisma.settlement.aggregate({
      where: {
        transporterId,
        status: PrismaSettlementStatus.PENDING,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? 0;
  }

  async getTotalPaidByTransporterId(transporterId: string): Promise<number> {
    const result = await this.prisma.settlement.aggregate({
      where: {
        transporterId,
        status: PrismaSettlementStatus.PAID,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? 0;
  }

  private mapToEntity(settlement: PrismaSettlement): Settlement {
    return new Settlement({
      id: settlement.id,
      amount: settlement.amount,
      status: settlement.status as SettlementStatus,
      transferDate: settlement.transferDate ?? undefined,
      transactionNumber: settlement.transactionNumber ?? undefined,
      comment: settlement.comment ?? undefined,
      screenshotUrl: settlement.screenshotUrl ?? undefined,
      paidAt: settlement.paidAt ?? undefined,
      orderId: settlement.orderId,
      transporterId: settlement.transporterId,
      bankAccountId: settlement.bankAccountId ?? undefined,
      registeredBy: settlement.registeredBy ?? undefined,
      createdAt: settlement.createdAt,
      updatedAt: settlement.updatedAt,
    });
  }
}
