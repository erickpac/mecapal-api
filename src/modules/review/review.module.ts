import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { OrderModule } from '../order/order.module';
import { REVIEW_TOKENS } from './domain/constants';
import { ReviewRepository } from './infrastructure/repositories/review.repository';
import { ReviewController } from './infrastructure/controllers/review.controller';
import {
  CreateReviewUseCase,
  GetReviewsReceivedUseCase,
  GetReviewsGivenUseCase,
  GetOrderReviewsUseCase,
  GetUserRatingStatsUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule, CognitoModule, OrderModule],
  controllers: [ReviewController],
  providers: [
    // Repository
    {
      provide: REVIEW_TOKENS.IReviewRepository,
      useClass: ReviewRepository,
    },
    // Use Cases
    CreateReviewUseCase,
    GetReviewsReceivedUseCase,
    GetReviewsGivenUseCase,
    GetOrderReviewsUseCase,
    GetUserRatingStatsUseCase,
  ],
  exports: [REVIEW_TOKENS.IReviewRepository],
})
export class ReviewModule {}
