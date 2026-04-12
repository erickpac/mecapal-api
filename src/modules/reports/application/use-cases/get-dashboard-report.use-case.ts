import { Injectable, Inject } from '@nestjs/common';
import { REPORTS_TOKENS } from '../../domain/constants';
import {
  IReportService,
  FullDashboardReport,
  ReportFilters,
} from '../../domain/interfaces';
import { ReportQueryDto, DateRangePreset } from '../dtos';

@Injectable()
export class GetDashboardReportUseCase {
  constructor(
    @Inject(REPORTS_TOKENS.IReportService)
    private readonly reportService: IReportService,
  ) {}

  async execute(query: ReportQueryDto): Promise<FullDashboardReport> {
    const filters = this.buildFilters(query);
    return this.reportService.getFullDashboard(filters);
  }

  private buildFilters(query: ReportQueryDto): ReportFilters {
    const now = new Date();
    let fromDate: Date;
    let toDate: Date = new Date(now.setHours(23, 59, 59, 999));

    if (query.preset && query.preset !== DateRangePreset.CUSTOM) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (query.preset) {
        case DateRangePreset.TODAY:
          fromDate = today;
          break;
        case DateRangePreset.WEEK:
          fromDate = new Date(today);
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case DateRangePreset.MONTH:
          fromDate = new Date(today);
          fromDate.setMonth(fromDate.getMonth() - 1);
          break;
        case DateRangePreset.YEAR:
          fromDate = new Date(today);
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        default:
          fromDate = new Date(today);
          fromDate.setMonth(fromDate.getMonth() - 1);
      }
    } else if (query.fromDate && query.toDate) {
      fromDate = new Date(query.fromDate);
      toDate = new Date(query.toDate);
    } else {
      // Default to last 30 days
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      fromDate.setHours(0, 0, 0, 0);
    }

    return {
      fromDate,
      toDate,
      transporterId: query.transporterId,
      clientId: query.clientId,
    };
  }
}
