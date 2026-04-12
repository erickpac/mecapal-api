import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  GetDashboardReportUseCase,
  GetFinancialSummaryUseCase,
} from '../../application/use-cases';
import { ReportQueryDto } from '../../application/dtos';

@Controller('reports')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
export class ReportsController {
  constructor(
    private readonly getDashboardReportUseCase: GetDashboardReportUseCase,
    private readonly getFinancialSummaryUseCase: GetFinancialSummaryUseCase,
  ) {}

  @Get('dashboard')
  async getDashboard(@Query() query: ReportQueryDto) {
    return this.getDashboardReportUseCase.execute(query);
  }

  @Get('financial-summary')
  async getFinancialSummary(@Query() query: ReportQueryDto) {
    return this.getFinancialSummaryUseCase.execute(query);
  }

  @Get('dashboard/export')
  async exportDashboard(@Query() query: ReportQueryDto, @Res() res: Response) {
    const report = await this.getDashboardReportUseCase.execute(query);

    // Generate CSV content
    const csvLines: string[] = [];

    // Financial Summary Section
    csvLines.push('=== FINANCIAL SUMMARY ===');
    csvLines.push('Metric,Value');
    csvLines.push(`Total Revenue,${report.financialSummary.totalRevenue}`);
    csvLines.push(
      `Total Commissions,${report.financialSummary.totalCommissions}`,
    );
    csvLines.push(`Total Taxes,${report.financialSummary.totalTaxes}`);
    csvLines.push(
      `Completed Transactions,${report.financialSummary.completedTransactions}`,
    );
    csvLines.push(
      `Pending Payments,${report.financialSummary.pendingPayments}`,
    );
    csvLines.push(
      `Pending Payments Count,${report.financialSummary.pendingPaymentsCount}`,
    );
    csvLines.push('');

    // Revenue by Day Section
    csvLines.push('=== REVENUE BY DAY ===');
    csvLines.push('Date,Revenue,Transactions');
    for (const day of report.revenueByDay) {
      csvLines.push(`${day.date},${day.revenue},${day.transactions}`);
    }
    csvLines.push('');

    // Revenue by Load Type Section
    csvLines.push('=== REVENUE BY LOAD TYPE ===');
    csvLines.push('Load Type,Revenue,Percentage');
    for (const type of report.revenueByLoadType) {
      csvLines.push(
        `${type.loadType},${type.revenue},${type.percentage.toFixed(2)}%`,
      );
    }
    csvLines.push('');

    // Top Transporters Section
    csvLines.push('=== TOP TRANSPORTERS ===');
    csvLines.push('Name,Total Earnings,Completed Orders,Average Rating');
    for (const transporter of report.topTransporters) {
      csvLines.push(
        `${transporter.transporterName},${transporter.totalEarnings},${transporter.completedOrders},${transporter.averageRating}`,
      );
    }
    csvLines.push('');

    // Order Stats Section
    csvLines.push('=== ORDER STATS ===');
    csvLines.push('Status,Count');
    csvLines.push(`Total,${report.orderStats.total}`);
    csvLines.push(`Confirmed,${report.orderStats.confirmed}`);
    csvLines.push(`In Progress,${report.orderStats.inProgress}`);
    csvLines.push(`Delivered,${report.orderStats.delivered}`);
    csvLines.push(`Completed,${report.orderStats.completed}`);
    csvLines.push(`Cancelled,${report.orderStats.cancelled}`);
    csvLines.push('');

    // User Stats Section
    csvLines.push('=== USER STATS ===');
    csvLines.push('Metric,Value');
    csvLines.push(`Total Clients,${report.userStats.totalClients}`);
    csvLines.push(`Total Transporters,${report.userStats.totalTransporters}`);
    csvLines.push(`Active Transporters,${report.userStats.activeTransporters}`);
    csvLines.push(
      `New Clients This Period,${report.userStats.newClientsThisPeriod}`,
    );
    csvLines.push(
      `New Transporters This Period,${report.userStats.newTransportersThisPeriod}`,
    );

    const csvContent = csvLines.join('\n');
    const filename = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  }
}
