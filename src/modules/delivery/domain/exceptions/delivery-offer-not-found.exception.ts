export class DeliveryOfferNotFoundException extends Error {
  constructor(offerId: string) {
    super(`Delivery offer with ID ${offerId} not found`);
    this.name = 'DeliveryOfferNotFoundException';
  }
}
