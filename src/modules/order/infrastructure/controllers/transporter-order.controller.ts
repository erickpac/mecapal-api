import {
  Controller,
  Get,
  Post,
  Patch,
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
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { GetTransporterOrdersUseCase } from '../../application/use-cases/get-transporter-orders.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { AddLocationUpdateUseCase } from '../../application/use-cases/add-location-update.use-case';
import { ConfirmDeliveryUseCase } from '../../application/use-cases/confirm-delivery.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import {
  OrderQueryDto,
  UpdateOrderStatusDto,
  AddLocationDto,
  ConfirmDeliveryDto,
  CancelOrderDto,
} from '../../application/dtos';

@Controller('orders/transporter')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class TransporterOrderController {
  constructor(
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getTransporterOrdersUseCase: GetTransporterOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly addLocationUpdateUseCase: AddLocationUpdateUseCase,
    private readonly confirmDeliveryUseCase: ConfirmDeliveryUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Get()
  async getMyOrders(@CurrentUser() user: User, @Query() query: OrderQueryDto) {
    return this.getTransporterOrdersUseCase.execute(user.id, {
      status: query.status,
    });
  }

  @Get('active')
  async getActiveOrder(@CurrentUser() user: User) {
    return this.getTransporterOrdersUseCase.getActiveOrder(user.id);
  }

  @Get(':id')
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getOrderUseCase.execute(id, user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusUseCase.execute(id, user.id, dto);
  }

  @Post(':id/location')
  async addLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: AddLocationDto,
  ) {
    return this.addLocationUpdateUseCase.execute(id, user.id, dto);
  }

  @Post(':id/deliver')
  async confirmDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    return this.confirmDeliveryUseCase.execute(id, user.id, dto);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: CancelOrderDto,
  ) {
    return this.cancelOrderUseCase.execute(id, user.id, dto);
  }
}
