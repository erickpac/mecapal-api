import { VehicleType } from '@prisma/client';

export class Vehicle {
  id: string;
  type: VehicleType;
  capacityKg: number;
  photoUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
