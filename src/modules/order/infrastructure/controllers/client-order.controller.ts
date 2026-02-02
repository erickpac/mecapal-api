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
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { GetClientOrdersUseCase } from '../../application/use-cases/get-client-orders.use-case';
import { GetOrderTrackingUseCase } from '../../application/use-cases/get-order-tracking.use-case';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import { OrderQueryDto, CancelOrderDto } from '../../application/dtos';

@Controller('orders/client')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientOrderController {
  constructor(
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getClientOrdersUseCase: GetClientOrdersUseCase,
    private readonly getOrderTrackingUseCase: GetOrderTrackingUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Get()
  async getMyOrders(@CurrentUser() user: User, @Query() query: OrderQueryDto) {
    return this.getClientOrdersUseCase.execute(user.id, {
      status: query.status,
    });
  }

  @Get(':id')
  async getOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getOrderUseCase.execute(id, user.id);
  }

  @Get(':id/tracking')
  async getOrderTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getOrderTrackingUseCase.execute(id, user.id);
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
