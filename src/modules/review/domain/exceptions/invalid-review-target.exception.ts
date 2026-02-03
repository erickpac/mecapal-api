import { BadRequestException } from '@nestjs/common';

export class InvalidReviewTargetException extends BadRequestException {
  constructor() {
    super('You cannot review this order');
  }
}
