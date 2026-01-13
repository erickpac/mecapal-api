export class DeliveryRequestNotFoundException extends Error {
  constructor(requestId: string) {
    super(`Delivery request with ID ${requestId} not found`);
    this.name = 'DeliveryRequestNotFoundException';
  }
}
