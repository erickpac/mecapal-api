export class DuplicateOfferException extends Error {
  constructor(requestId: string) {
    super(`You already have an offer for delivery request ${requestId}`);
    this.name = 'DuplicateOfferException';
  }
}
