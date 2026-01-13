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
import { CreateDeliveryRequestUseCase } from '../../application/use-cases/client/create-delivery-request.use-case';
import { GetMyDeliveryRequestsUseCase } from '../../application/use-cases/client/get-my-delivery-requests.use-case';
import { GetDeliveryRequestUseCase } from '../../application/use-cases/client/get-delivery-request.use-case';
import { UpdateDeliveryRequestUseCase } from '../../application/use-cases/client/update-delivery-request.use-case';
import { PublishDeliveryRequestUseCase } from '../../application/use-cases/client/publish-delivery-request.use-case';
import { CancelDeliveryRequestUseCase } from '../../application/use-cases/client/cancel-delivery-request.use-case';
import { GetOffersForRequestUseCase } from '../../application/use-cases/client/get-offers-for-request.use-case';
import { AcceptOfferUseCase } from '../../application/use-cases/client/accept-offer.use-case';
import { CreateDeliveryRequestDto } from '../../application/dtos/create-delivery-request.dto';
import { UpdateDeliveryRequestDto } from '../../application/dtos/update-delivery-request.dto';
import { DeliveryRequestQueryDto } from '../../application/dtos/delivery-request-query.dto';

@Controller('delivery/client')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class ClientDeliveryController {
  constructor(
    private readonly createDeliveryRequestUseCase: CreateDeliveryRequestUseCase,
    private readonly getMyDeliveryRequestsUseCase: GetMyDeliveryRequestsUseCase,
    private readonly getDeliveryRequestUseCase: GetDeliveryRequestUseCase,
    private readonly updateDeliveryRequestUseCase: UpdateDeliveryRequestUseCase,
    private readonly publishDeliveryRequestUseCase: PublishDeliveryRequestUseCase,
    private readonly cancelDeliveryRequestUseCase: CancelDeliveryRequestUseCase,
    private readonly getOffersForRequestUseCase: GetOffersForRequestUseCase,
    private readonly acceptOfferUseCase: AcceptOfferUseCase,
  ) {}

  @Post('requests')
  async createRequest(
    @CurrentUser() user: User,
    @Body() dto: CreateDeliveryRequestDto,
  ) {
    return this.createDeliveryRequestUseCase.execute(user.id, dto);
  }

  @Get('requests')
  async getMyRequests(
    @CurrentUser() user: User,
    @Query() query: DeliveryRequestQueryDto,
  ) {
    return this.getMyDeliveryRequestsUseCase.execute(user.id, query);
  }

  @Get('requests/:id')
  async getRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getDeliveryRequestUseCase.execute(id, user.id);
  }

  @Patch('requests/:id')
  async updateRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateDeliveryRequestDto,
  ) {
    return this.updateDeliveryRequestUseCase.execute(id, user.id, dto);
  }

  @Post('requests/:id/publish')
  async publishRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.publishDeliveryRequestUseCase.execute(id, user.id);
  }

  @Post('requests/:id/cancel')
  async cancelRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.cancelDeliveryRequestUseCase.execute(id, user.id);
  }

  @Get('requests/:id/offers')
  async getOffersForRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getOffersForRequestUseCase.execute(id, user.id);
  }

  @Post('requests/:requestId/offers/:offerId/accept')
  async acceptOffer(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @CurrentUser() user: User,
  ) {
    return this.acceptOfferUseCase.execute(requestId, offerId, user.id);
  }
}
