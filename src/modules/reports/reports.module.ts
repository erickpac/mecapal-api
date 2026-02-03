import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';

// Controller
import { ReportsController } from './infrastructure/controllers/reports.controller';

// Services
import { ReportService } from './infrastructure/services/report.service';

// Use Cases
import {
  GetDashboardReportUseCase,
  GetFinancialSummaryUseCase,
} from './application/use-cases';

// Tokens
import { REPORTS_TOKENS } from './domain/constants';

@Module({
  imports: [PrismaModule, CognitoModule],
  controllers: [ReportsController],
  providers: [
    // Services
    {
      provide: REPORTS_TOKENS.IReportService,
      useClass: ReportService,
    },

    // Use Cases
    GetDashboardReportUseCase,
    GetFinancialSummaryUseCase,
  ],
  exports: [REPORTS_TOKENS.IReportService],
})
export class ReportsModule {}
