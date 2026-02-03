export interface DateRangeFilter {
  fromDate: Date;
  toDate: Date;
}

export interface ReportFilters extends DateRangeFilter {
  loadType?: string;
  transporterId?: string;
  clientId?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCommissions: number;
  totalTaxes: number;
  completedTransactions: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  transactions: number;
}

export interface RevenueByLoadType {
  loadType: string;
  revenue: number;
  percentage: number;
}

export interface TopTransporter {
  transporterId: string;
  transporterName: string;
  totalEarnings: number;
  completedOrders: number;
  averageRating: number;
}

export interface OrderStats {
  total: number;
  confirmed: number;
  inProgress: number;
  delivered: number;
  completed: number;
  cancelled: number;
}

export interface DeliveryRequestStats {
  total: number;
  draft: number;
  published: number;
  offersReceived: number;
  accepted: number;
  inProgress: number;
  delivered: number;
  cancelled: number;
}

export interface UserStats {
  totalClients: number;
  totalTransporters: number;
  activeTransporters: number;
  newClientsThisPeriod: number;
  newTransportersThisPeriod: number;
}

export interface FullDashboardReport {
  financialSummary: FinancialSummary;
  revenueByDay: RevenueByDay[];
  revenueByLoadType: RevenueByLoadType[];
  topTransporters: TopTransporter[];
  orderStats: OrderStats;
  deliveryRequestStats: DeliveryRequestStats;
  userStats: UserStats;
  period: {
    from: string;
    to: string;
  };
}
