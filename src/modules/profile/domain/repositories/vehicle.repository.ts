import { Vehicle } from '../entities/vehicle.entity';

export interface IVehicleRepository {
  create(userId: string, data: Partial<Vehicle>): Promise<Vehicle>;
  findAll(userId: string): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
