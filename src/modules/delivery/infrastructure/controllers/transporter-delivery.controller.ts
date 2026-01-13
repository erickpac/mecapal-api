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
import { GetAvailableRequestsUseCase } from '../../application/use-cases/transporter/get-available-requests.use-case';
import { GetRequestDetailsUseCase } from '../../application/use-cases/transporter/get-request-details.use-case';
import { CreateDeliveryOfferUseCase } from '../../application/use-cases/transporter/create-delivery-offer.use-case';
import { GetMyOffersUseCase } from '../../application/use-cases/transporter/get-my-offers.use-case';
import { CancelOfferUseCase } from '../../application/use-cases/transporter/cancel-offer.use-case';
import { CreateDeliveryOfferDto } from '../../application/dtos/create-delivery-offer.dto';
import { DeliveryRequestQueryDto } from '../../application/dtos/delivery-request-query.dto';
import { DeliveryOfferQueryDto } from '../../application/dtos/delivery-offer-query.dto';

@Controller('delivery/transporter')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class TransporterDeliveryController {
  constructor(
    private readonly getAvailableRequestsUseCase: GetAvailableRequestsUseCase,
    private readonly getRequestDetailsUseCase: GetRequestDetailsUseCase,
    private readonly createDeliveryOfferUseCase: CreateDeliveryOfferUseCase,
    private readonly getMyOffersUseCase: GetMyOffersUseCase,
    private readonly cancelOfferUseCase: CancelOfferUseCase,
  ) {}

  @Get('requests')
  async getAvailableRequests(@Query() query: DeliveryRequestQueryDto) {
    return this.getAvailableRequestsUseCase.execute(query);
  }

  @Get('requests/:id')
  async getRequestDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.getRequestDetailsUseCase.execute(id);
  }

  @Post('requests/:id/offer')
  async createOffer(
    @Param('id', ParseUUIDPipe) requestId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateDeliveryOfferDto,
  ) {
    return this.createDeliveryOfferUseCase.execute(requestId, user.id, dto);
  }

  @Get('offers')
  async getMyOffers(
    @CurrentUser() user: User,
    @Query() query: DeliveryOfferQueryDto,
  ) {
    return this.getMyOffersUseCase.execute(user.id, query);
  }

  @Post('offers/:id/cancel')
  async cancelOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.cancelOfferUseCase.execute(id, user.id);
  }
}
