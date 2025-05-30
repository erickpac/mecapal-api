import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVehiclePhotoRepository } from '../../domain/repositories/vehicle-photo.repository';
import { VehiclePhoto } from '../../domain/entities/vehicle-photo.entity';
import { UploadVehiclePhotoDto } from '../../application/dtos/upload-vehicle-photo.dto';

@Injectable()
export class VehiclePhotoRepository implements IVehiclePhotoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    vehicleId: string,
    data: UploadVehiclePhotoDto,
  ): Promise<VehiclePhoto> {
    const photo = await this.prisma.vehiclePhoto.create({
      data: {
        ...data,
        vehicleId,
      },
    });

    return photo as VehiclePhoto;
  }

  async findAll(vehicleId: string): Promise<VehiclePhoto[]> {
    const photos = await this.prisma.vehiclePhoto.findMany({
      where: { vehicleId },
    });
    return photos as VehiclePhoto[];
  }

  async findById(id: string): Promise<VehiclePhoto | null> {
    const photo = await this.prisma.vehiclePhoto.findUnique({
      where: { id },
    });
    return photo as VehiclePhoto | null;
  }

  async update(id: string, data: UploadVehiclePhotoDto): Promise<VehiclePhoto> {
    const photo = await this.prisma.vehiclePhoto.update({
      where: { id },
      data,
    });
    return photo as VehiclePhoto;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehiclePhoto.delete({
      where: { id },
    });
  }

  async setMainPhoto(vehicleId: string, photoId: string): Promise<void> {
    // First, set all photos of the vehicle to not main
    await this.prisma.vehiclePhoto.updateMany({
      where: { vehicleId },
      data: { isMain: false },
    });

    // Then set the selected photo as main
    await this.prisma.vehiclePhoto.update({
      where: { id: photoId },
      data: { isMain: true },
    });
  }
}
