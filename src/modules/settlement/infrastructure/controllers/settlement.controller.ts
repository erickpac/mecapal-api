import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  GetPendingSettlementsUseCase,
  GetSettlementUseCase,
  GetSettlementsUseCase,
  RecordPaymentUseCase,
  GetTransporterEarningsUseCase,
} from '../../application/use-cases';
import { RecordPaymentDto, SettlementQueryDto } from '../../application/dtos';
import { SettlementNotFoundException } from '../../domain/exceptions';

@Controller('settlements')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class SettlementController {
  constructor(
    private readonly getPendingSettlementsUseCase: GetPendingSettlementsUseCase,
    private readonly getSettlementUseCase: GetSettlementUseCase,
    private readonly getSettlementsUseCase: GetSettlementsUseCase,
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly getTransporterEarningsUseCase: GetTransporterEarningsUseCase,
  ) {}

  // ==================== TRANSPORTER ENDPOINTS ====================
  // Note: These must be defined before :id routes to avoid conflicts

  @Get('my-earnings')
  @Roles(UserRole.TRANSPORTER)
  async getMyEarnings(@CurrentUser() user: User) {
    return this.getTransporterEarningsUseCase.execute(user.id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async getPending() {
    return this.getPendingSettlementsUseCase.execute();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async getAll(@Query() query: SettlementQueryDto) {
    return this.getSettlementsUseCase.execute(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE, UserRole.TRANSPORTER)
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const settlement = await this.getSettlementUseCase.execute(id);

    // Transporters can only see their own settlements
    if (
      user.role === UserRole.TRANSPORTER &&
      settlement.transporterId !== user.id
    ) {
      // Return 404 to avoid exposing existence of other settlements
      throw new SettlementNotFoundException(id);
    }

    return settlement;
  }

  @Post(':id/pay')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.recordPaymentUseCase.execute(id, user.id, dto);
  }
}
