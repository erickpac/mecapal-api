export class VehicleNotFoundException extends Error {
  constructor(vehicleId: string) {
    super(`Vehicle with ID ${vehicleId} not found`);
    this.name = 'VehicleNotFoundException';
  }
}
