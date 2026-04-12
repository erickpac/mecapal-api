import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IReportService,
  ReportFilters,
  FinancialSummary,
  RevenueByDay,
  RevenueByLoadType,
  TopTransporter,
  OrderStats,
  DeliveryRequestStats,
  UserStats,
  FullDashboardReport,
} from '../../domain/interfaces';
import {
  TransactionStatus,
  OrderStatus,
  DeliveryRequestStatus,
  SettlementStatus,
} from '@prisma/client';

@Injectable()
export class ReportService implements IReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary> {
    const { fromDate, toDate } = filters;

    // Get completed transactions in the period
    const transactionStats = await this.prisma.transaction.aggregate({
      where: {
        status: TransactionStatus.SUCCEEDED,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: {
        amount: true,
        commissionAmount: true,
        taxAmount: true,
      },
      _count: true,
    });

    // Get pending settlements (payments to transporters)
    const pendingSettlements = await this.prisma.settlement.aggregate({
      where: {
        status: SettlementStatus.PENDING,
        createdAt: { gte: fromDate, lte: toDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalRevenue: transactionStats._sum.amount ?? 0,
      totalCommissions: transactionStats._sum.commissionAmount ?? 0,
      totalTaxes: transactionStats._sum.taxAmount ?? 0,
      completedTransactions: transactionStats._count,
      pendingPayments: pendingSettlements._sum.amount ?? 0,
      pendingPaymentsCount: pendingSettlements._count,
    };
  }

  async getRevenueByDay(filters: ReportFilters): Promise<RevenueByDay[]> {
    const { fromDate, toDate } = filters;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.SUCCEEDED,
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const revenueByDay = new Map<
      string,
      { revenue: number; transactions: number }
    >();

    for (const tx of transactions) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      const existing = revenueByDay.get(dateKey) || {
        revenue: 0,
        transactions: 0,
      };
      existing.revenue += tx.amount;
      existing.transactions += 1;
      revenueByDay.set(dateKey, existing);
    }

    return Array.from(revenueByDay.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions,
    }));
  }

  async getRevenueByLoadType(
    filters: ReportFilters,
  ): Promise<RevenueByLoadType[]> {
    const { fromDate, toDate } = filters;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.SUCCEEDED,
        createdAt: { gte: fromDate, lte: toDate },
      },
      include: {
        order: {
          include: {
            deliveryOffer: {
              include: {
                deliveryRequest: true,
              },
            },
          },
        },
      },
    });

    const revenueByType = new Map<string, number>();
    let totalRevenue = 0;

    for (const tx of transactions) {
      const loadType =
        tx.order?.deliveryOffer?.deliveryRequest?.loadType || 'UNKNOWN';
      const current = revenueByType.get(loadType) || 0;
      revenueByType.set(loadType, current + tx.amount);
      totalRevenue += tx.amount;
    }

    return Array.from(revenueByType.entries()).map(([loadType, revenue]) => ({
      loadType,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }));
  }

  async getTopTransporters(
    filters: ReportFilters,
    limit = 10,
  ): Promise<TopTransporter[]> {
    const { fromDate, toDate } = filters;

    const transporterEarnings = await this.prisma.settlement.groupBy({
      by: ['transporterId'],
      where: {
        status: SettlementStatus.PAID,
        paidAt: { gte: fromDate, lte: toDate },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });

    const topTransporters: TopTransporter[] = [];

    for (const earning of transporterEarnings) {
      const transporter = await this.prisma.user.findUnique({
        where: { id: earning.transporterId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          averageRating: true,
        },
      });

      if (transporter) {
        topTransporters.push({
          transporterId: transporter.id,
          transporterName: `${transporter.firstName} ${transporter.lastName}`,
          totalEarnings: earning._sum.amount ?? 0,
          completedOrders: earning._count,
          averageRating: transporter.averageRating,
        });
      }
    }

    return topTransporters;
  }

  async getOrderStats(filters: ReportFilters): Promise<OrderStats> {
    const { fromDate, toDate } = filters;

    const baseWhere = {
      createdAt: { gte: fromDate, lte: toDate },
    };

    const [total, confirmed, inProgress, delivered, completed, cancelled] =
      await Promise.all([
        this.prisma.order.count({ where: baseWhere }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.CONFIRMED },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.IN_PROGRESS },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.DELIVERED },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.COMPLETED },
        }),
        this.prisma.order.count({
          where: { ...baseWhere, status: OrderStatus.CANCELLED },
        }),
      ]);

    return { total, confirmed, inProgress, delivered, completed, cancelled };
  }

  async getDeliveryRequestStats(
    filters: ReportFilters,
  ): Promise<DeliveryRequestStats> {
    const { fromDate, toDate } = filters;

    const baseWhere = {
      createdAt: { gte: fromDate, lte: toDate },
    };

    const [
      total,
      draft,
      published,
      offersReceived,
      accepted,
      inProgress,
      delivered,
      cancelled,
    ] = await Promise.all([
      this.prisma.deliveryRequest.count({ where: baseWhere }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.DRAFT },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.PUBLISHED },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.OFFERS_RECEIVED },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.ACCEPTED },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.IN_PROGRESS },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.DELIVERED },
      }),
      this.prisma.deliveryRequest.count({
        where: { ...baseWhere, status: DeliveryRequestStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      draft,
      published,
      offersReceived,
      accepted,
      inProgress,
      delivered,
      cancelled,
    };
  }

  async getUserStats(filters: ReportFilters): Promise<UserStats> {
    const { fromDate, toDate } = filters;

    const [
      totalClients,
      totalTransporters,
      activeTransporters,
      newClientsThisPeriod,
      newTransportersThisPeriod,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.user.count({ where: { role: 'TRANSPORTER' } }),
      this.prisma.transporterProfile.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { gte: fromDate, lte: toDate },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'TRANSPORTER',
          createdAt: { gte: fromDate, lte: toDate },
        },
      }),
    ]);

    return {
      totalClients,
      totalTransporters,
      activeTransporters,
      newClientsThisPeriod,
      newTransportersThisPeriod,
    };
  }

  async getFullDashboard(filters: ReportFilters): Promise<FullDashboardReport> {
    const [
      financialSummary,
      revenueByDay,
      revenueByLoadType,
      topTransporters,
      orderStats,
      deliveryRequestStats,
      userStats,
    ] = await Promise.all([
      this.getFinancialSummary(filters),
      this.getRevenueByDay(filters),
      this.getRevenueByLoadType(filters),
      this.getTopTransporters(filters),
      this.getOrderStats(filters),
      this.getDeliveryRequestStats(filters),
      this.getUserStats(filters),
    ]);

    return {
      financialSummary,
      revenueByDay,
      revenueByLoadType,
      topTransporters,
      orderStats,
      deliveryRequestStats,
      userStats,
      period: {
        from: filters.fromDate.toISOString(),
        to: filters.toDate.toISOString(),
      },
    };
  }
}
