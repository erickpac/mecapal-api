import { Injectable } from '@nestjs/common';
import { Vehicle as PrismaVehicle } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IVehicleRepository,
  CreateVehicleData,
  UpdateVehicleData,
} from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { LoadType } from '../../domain/enums/load-type.enum';
import { VehicleStatus } from '../../domain/enums/vehicle-status.enum';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateVehicleData): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...data,
        userId,
      },
    });

    return this.mapToEntity(vehicle);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) return null;

    return this.mapToEntity(vehicle);
  }

  async findByUserId(userId: string): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles.map((vehicle) => this.mapToEntity(vehicle));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.vehicle.count({
      where: { userId },
    });
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data,
    });

    return this.mapToEntity(vehicle);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }

  async existsByLicensePlate(licensePlate: string): Promise<boolean> {
    const count = await this.prisma.vehicle.count({
      where: { licensePlate },
    });
    return count > 0;
  }

  async existsByVin(vin: string): Promise<boolean> {
    const count = await this.prisma.vehicle.count({
      where: { vin },
    });
    return count > 0;
  }

  async isInUseByDeliveryOffer(id: string): Promise<boolean> {
    const count = await this.prisma.deliveryOffer.count({
      where: {
        vehicleId: id,
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
      },
    });
    return count > 0;
  }

  private mapToEntity(vehicle: PrismaVehicle): Vehicle {
    return new Vehicle({
      ...vehicle,
      vehicleType: vehicle.vehicleType as VehicleType,
      loadType: vehicle.loadType as LoadType,
      status: vehicle.status as VehicleStatus,
    });
  }
}
