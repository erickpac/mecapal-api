import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  CreateReviewUseCase,
  GetReviewsReceivedUseCase,
  GetReviewsGivenUseCase,
  GetOrderReviewsUseCase,
  GetUserRatingStatsUseCase,
} from '../../application/use-cases';
import { CreateReviewDto } from '../../application/dtos';

@Controller('reviews')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getReviewsReceivedUseCase: GetReviewsReceivedUseCase,
    private readonly getReviewsGivenUseCase: GetReviewsGivenUseCase,
    private readonly getOrderReviewsUseCase: GetOrderReviewsUseCase,
    private readonly getUserRatingStatsUseCase: GetUserRatingStatsUseCase,
  ) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.createReviewUseCase.execute(user.id, user.role, dto);
  }

  @Get('received')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async getReceived(@CurrentUser() user: User) {
    return this.getReviewsReceivedUseCase.execute(user.id);
  }

  @Get('given')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async getGiven(@CurrentUser() user: User) {
    return this.getReviewsGivenUseCase.execute(user.id);
  }

  @Get('order/:orderId')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER, UserRole.ADMIN, UserRole.BACKOFFICE)
  async getOrderReviews(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.getOrderReviewsUseCase.execute(orderId);
  }

  @Get('user/:userId/stats')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER, UserRole.ADMIN, UserRole.BACKOFFICE)
  async getUserStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.getUserRatingStatsUseCase.execute(userId);
  }

  @Get('my-stats')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async getMyStats(@CurrentUser() user: User) {
    return this.getUserRatingStatsUseCase.execute(user.id);
  }
}
