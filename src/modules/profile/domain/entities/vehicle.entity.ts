import { VehicleType } from '../enums/vehicle-type.enum';
import { VehiclePhoto } from './vehicle-photo.entity';

export class Vehicle {
  id: string;
  type: VehicleType;
  capacityKg: number;
  photos?: VehiclePhoto[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
