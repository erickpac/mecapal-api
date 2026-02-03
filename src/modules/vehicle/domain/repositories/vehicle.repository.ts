import { Vehicle } from '../entities/vehicle.entity';
import { VehicleType } from '../enums/vehicle-type.enum';
import { LoadType } from '../enums/load-type.enum';

export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  vehicleType: VehicleType;
  loadType: LoadType;
  maxWeightKg: number;
  maxVolumeM3: number;
  frontPhotoUrl: string;
  rearPhotoUrl: string;
  sidePhotoUrl: string;
  interiorPhotoUrl: string;
  registrationDocUrl: string;
  insuranceDocUrl: string;
  insuranceExpiration: Date;
}

export type UpdateVehicleData = Partial<
  Omit<CreateVehicleData, 'licensePlate' | 'vin'>
>;

export interface IVehicleRepository {
  create(userId: string, data: CreateVehicleData): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByUserId(userId: string): Promise<Vehicle[]>;
  countByUserId(userId: string): Promise<number>;
  update(id: string, data: UpdateVehicleData): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  existsByLicensePlate(licensePlate: string): Promise<boolean>;
  existsByVin(vin: string): Promise<boolean>;
  isInUseByDeliveryOffer(id: string): Promise<boolean>;
}
