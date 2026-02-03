import { Injectable, Inject } from '@nestjs/common';
import { REVIEW_TOKENS } from '../../domain/constants';
import { IReviewRepository } from '../../domain/interfaces';
import { Review } from '../../domain/entities';
import { ReviewType } from '../../domain/enums';
import {
  ReviewAlreadyExistsException,
  InvalidReviewTargetException,
  OrderNotCompletedException,
} from '../../domain/exceptions';
import { ORDER_TOKENS } from '../../../order/domain/constants';
import { IOrderRepository } from '../../../order/domain/interfaces';
import { OrderStatus } from '../../../order/domain/enums';
import { OrderNotFoundException } from '../../../order/domain/exceptions';
import { CreateReviewDto } from '../dtos';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(REVIEW_TOKENS.IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
    @Inject(ORDER_TOKENS.IOrderRepository)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    userId: string,
    userRole: UserRole,
    dto: CreateReviewDto,
  ): Promise<Review> {
    // Get the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new OrderNotFoundException(dto.orderId);
    }

    // Verify order is completed (DELIVERED or COMPLETED status)
    if (
      ![OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status)
    ) {
      throw new OrderNotCompletedException();
    }

    // Determine review type and validate user can review this order
    let reviewType: ReviewType;
    let revieweeId: string;

    if (userRole === UserRole.CLIENT && order.clientId === userId) {
      // Client reviewing transporter
      reviewType = ReviewType.CLIENT_TO_TRANSPORTER;
      revieweeId = order.transporterId;
    } else if (
      userRole === UserRole.TRANSPORTER &&
      order.transporterId === userId
    ) {
      // Transporter reviewing client
      reviewType = ReviewType.TRANSPORTER_TO_CLIENT;
      revieweeId = order.clientId;
    } else {
      throw new InvalidReviewTargetException();
    }

    // Check if review already exists
    const exists = await this.reviewRepository.existsByOrderIdAndType(
      dto.orderId,
      reviewType,
    );
    if (exists) {
      throw new ReviewAlreadyExistsException();
    }

    // Create the review
    const review = await this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      type: reviewType,
      reviewerId: userId,
      revieweeId,
      orderId: dto.orderId,
    });

    // Update reviewee's rating stats
    await this.reviewRepository.updateUserRatingStats(revieweeId);

    return review;
  }
}
