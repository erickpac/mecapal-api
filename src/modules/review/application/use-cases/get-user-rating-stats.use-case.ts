import { Injectable, Inject } from '@nestjs/common';
import { REVIEW_TOKENS } from '../../domain/constants';
import { IReviewRepository, UserRatingStats } from '../../domain/interfaces';

@Injectable()
export class GetUserRatingStatsUseCase {
  constructor(
    @Inject(REVIEW_TOKENS.IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(userId: string): Promise<UserRatingStats> {
    return this.reviewRepository.getUserRatingStats(userId);
  }
}
