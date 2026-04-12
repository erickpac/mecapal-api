import {
  ReportFilters,
  FinancialSummary,
  RevenueByDay,
  RevenueByLoadType,
  TopTransporter,
  OrderStats,
  DeliveryRequestStats,
  UserStats,
  FullDashboardReport,
} from './report-data.interface';

export interface IReportService {
  getFinancialSummary(filters: ReportFilters): Promise<FinancialSummary>;
  getRevenueByDay(filters: ReportFilters): Promise<RevenueByDay[]>;
  getRevenueByLoadType(filters: ReportFilters): Promise<RevenueByLoadType[]>;
  getTopTransporters(
    filters: ReportFilters,
    limit?: number,
  ): Promise<TopTransporter[]>;
  getOrderStats(filters: ReportFilters): Promise<OrderStats>;
  getDeliveryRequestStats(
    filters: ReportFilters,
  ): Promise<DeliveryRequestStats>;
  getUserStats(filters: ReportFilters): Promise<UserStats>;
  getFullDashboard(filters: ReportFilters): Promise<FullDashboardReport>;
}
