import { NotFoundException } from '@nestjs/common';

export class ReviewNotFoundException extends NotFoundException {
  constructor(id?: string) {
    super(id ? `Review with ID ${id} not found` : 'Review not found');
  }
}
