export class AddressLimitExceededException extends Error {
  constructor(limit: number) {
    super(`Maximum number of addresses (${limit}) has been reached`);
    this.name = 'AddressLimitExceededException';
  }
}
