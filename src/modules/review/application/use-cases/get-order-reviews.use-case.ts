import { Injectable, Inject } from '@nestjs/common';
import { REVIEW_TOKENS } from '../../domain/constants';
import { IReviewRepository } from '../../domain/interfaces';
import { Review } from '../../domain/entities';

@Injectable()
export class GetOrderReviewsUseCase {
  constructor(
    @Inject(REVIEW_TOKENS.IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(orderId: string): Promise<Review[]> {
    return this.reviewRepository.findByOrderId(orderId);
  }
}
