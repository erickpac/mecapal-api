import { Review } from '../entities';
import { ReviewType } from '../enums';

export interface CreateReviewData {
  rating: number;
  comment?: string;
  type: ReviewType;
  reviewerId: string;
  revieweeId: string;
  orderId: string;
}

export interface UserRatingStats {
  averageRating: number;
  totalReviews: number;
}

export interface IReviewRepository {
  create(data: CreateReviewData): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByOrderId(orderId: string): Promise<Review[]>;
  findByOrderIdAndType(orderId: string, type: ReviewType): Promise<Review | null>;
  findByReviewerId(reviewerId: string): Promise<Review[]>;
  findByRevieweeId(revieweeId: string): Promise<Review[]>;
  existsByOrderIdAndType(orderId: string, type: ReviewType): Promise<boolean>;
  getUserRatingStats(userId: string): Promise<UserRatingStats>;
  updateUserRatingStats(userId: string): Promise<void>;
}
