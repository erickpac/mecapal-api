import { ConflictException } from '@nestjs/common';

export class ReviewAlreadyExistsException extends ConflictException {
  constructor() {
    super('You have already submitted a review for this order');
  }
}
