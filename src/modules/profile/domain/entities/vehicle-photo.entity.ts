import { Vehicle } from './vehicle.entity';

export class VehiclePhoto {
  id: string;
  url: string;
  isMain: boolean;
  vehicleId: string;
  vehicle?: Vehicle;
  createdAt: Date;
  updatedAt: Date;
}
