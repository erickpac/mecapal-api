import { Vehicle } from '../entities/vehicle.entity';

export interface IVehicleRepository {
  create(
    userId: string,
    data: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'photos'>,
  ): Promise<Vehicle>;
  findAll(userId: string): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(
    id: string,
    data: Partial<
      Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'photos'>
    >,
  ): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}
