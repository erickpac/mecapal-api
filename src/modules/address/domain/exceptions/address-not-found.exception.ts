export class AddressNotFoundException extends Error {
  constructor(addressId: string) {
    super(`Address with ID ${addressId} not found`);
    this.name = 'AddressNotFoundException';
  }
}
