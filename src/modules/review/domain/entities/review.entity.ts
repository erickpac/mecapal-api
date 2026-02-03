import { ReviewType } from '../enums';

export interface ReviewProps {
  id: string;
  rating: number;
  comment?: string;
  type: ReviewType;
  reviewerId: string;
  revieweeId: string;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Review {
  readonly id: string;
  readonly rating: number;
  readonly comment?: string;
  readonly type: ReviewType;
  readonly reviewerId: string;
  readonly revieweeId: string;
  readonly orderId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ReviewProps) {
    this.id = props.id;
    this.rating = props.rating;
    this.comment = props.comment;
    this.type = props.type;
    this.reviewerId = props.reviewerId;
    this.revieweeId = props.revieweeId;
    this.orderId = props.orderId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isClientReview(): boolean {
    return this.type === ReviewType.CLIENT_TO_TRANSPORTER;
  }

  isTransporterReview(): boolean {
    return this.type === ReviewType.TRANSPORTER_TO_CLIENT;
  }
}
