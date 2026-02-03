import { Injectable, Inject } from '@nestjs/common';
import { REVIEW_TOKENS } from '../../domain/constants';
import { IReviewRepository } from '../../domain/interfaces';
import { Review } from '../../domain/entities';

@Injectable()
export class GetReviewsGivenUseCase {
  constructor(
    @Inject(REVIEW_TOKENS.IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(userId: string): Promise<Review[]> {
    return this.reviewRepository.findByReviewerId(userId);
  }
}
