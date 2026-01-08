import { VehicleType } from '../enums/vehicle-type.enum';
import { LoadType } from '../enums/load-type.enum';
import { VehicleStatus } from '../enums/vehicle-status.enum';

export class Vehicle {
  id: string;

  // Basic Info
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  vehicleType: VehicleType;

  // Capacity
  loadType: LoadType;
  maxWeightKg: number;
  maxVolumeM3: number;

  // Photos
  frontPhotoUrl: string;
  rearPhotoUrl: string;
  sidePhotoUrl: string;
  interiorPhotoUrl: string;

  // Documents
  registrationDocUrl: string;
  insuranceDocUrl: string;
  insuranceExpiration: Date;

  // Status
  status: VehicleStatus;

  // Relations
  userId: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Vehicle>) {
    Object.assign(this, partial);
  }
}
