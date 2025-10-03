import { VehicleType } from '@prisma/client';
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
