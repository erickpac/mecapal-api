import { VehiclePhoto } from '../entities/vehicle-photo.entity';
import { UploadVehiclePhotoDto } from '../../application/dtos/upload-vehicle-photo.dto';

export interface IVehiclePhotoRepository {
  create(vehicleId: string, data: UploadVehiclePhotoDto): Promise<VehiclePhoto>;
  findAll(vehicleId: string): Promise<VehiclePhoto[]>;
  findById(id: string): Promise<VehiclePhoto | null>;
  update(id: string, data: UploadVehiclePhotoDto): Promise<VehiclePhoto>;
  delete(id: string): Promise<void>;
  setMainPhoto(vehicleId: string, photoId: string): Promise<void>;
}
