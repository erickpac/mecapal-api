import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IReviewRepository,
  CreateReviewData,
  UserRatingStats,
} from '../../domain/interfaces';
import { Review } from '../../domain/entities';
import { ReviewType } from '../../domain/enums';
import {
  Review as PrismaReview,
  ReviewType as PrismaReviewType,
} from '@prisma/client';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReviewData): Promise<Review> {
    const review = await this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        type: data.type as PrismaReviewType,
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
        orderId: data.orderId,
      },
    });

    return this.mapToEntity(review);
  }

  async findById(id: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) return null;
    return this.mapToEntity(review);
  }

  async findByOrderId(orderId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToEntity(r));
  }

  async findByOrderIdAndType(
    orderId: string,
    type: ReviewType,
  ): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        orderId_type: {
          orderId,
          type: type as PrismaReviewType,
        },
      },
    });

    if (!review) return null;
    return this.mapToEntity(review);
  }

  async findByReviewerId(reviewerId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { reviewerId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToEntity(r));
  }

  async findByRevieweeId(revieweeId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => this.mapToEntity(r));
  }

  async existsByOrderIdAndType(
    orderId: string,
    type: ReviewType,
  ): Promise<boolean> {
    const count = await this.prisma.review.count({
      where: {
        orderId,
        type: type as PrismaReviewType,
      },
    });
    return count > 0;
  }

  async getUserRatingStats(userId: string): Promise<UserRatingStats> {
    const result = await this.prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: result._avg.rating ?? 0,
      totalReviews: result._count.rating,
    };
  }

  async updateUserRatingStats(userId: string): Promise<void> {
    const stats = await this.getUserRatingStats(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      },
    });
  }

  private mapToEntity(review: PrismaReview): Review {
    return new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? undefined,
      type: review.type as ReviewType,
      reviewerId: review.reviewerId,
      revieweeId: review.revieweeId,
      orderId: review.orderId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }
}
