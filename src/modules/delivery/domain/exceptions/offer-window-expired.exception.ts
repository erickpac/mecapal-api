export class OfferWindowExpiredException extends Error {
  constructor(requestId: string) {
    super(`Offer window for delivery request ${requestId} has expired`);
    this.name = 'OfferWindowExpiredException';
  }
}
