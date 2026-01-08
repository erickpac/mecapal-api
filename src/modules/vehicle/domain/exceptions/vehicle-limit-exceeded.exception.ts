export class VehicleLimitExceededException extends Error {
  constructor(limit: number) {
    super(`Maximum number of vehicles (${limit}) has been reached`);
    this.name = 'VehicleLimitExceededException';
  }
}
