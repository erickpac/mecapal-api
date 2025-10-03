import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import { VehicleType as PrismaVehicleType } from '@prisma/client';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'photos'>,
  ): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...data,
        type: data.type as PrismaVehicleType,
        userId,
      },
    });
    return this.mapToDomain(vehicle);
  }

  async findAll(userId: string): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
    });
    return vehicles.map((vehicle) => this.mapToDomain(vehicle));
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    return vehicle ? this.mapToDomain(vehicle) : null;
  }

  async update(
    id: string,
    data: Partial<
      Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'photos'>
    >,
  ): Promise<Vehicle> {
    const updateData = data.type
      ? { ...data, type: data.type as PrismaVehicleType }
      : data;

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
    return this.mapToDomain(vehicle);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaVehicle: {
    id: string;
    type: PrismaVehicleType;
    capacityKg: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Vehicle {
    return {
      id: prismaVehicle.id,
      type: prismaVehicle.type as VehicleType,
      capacityKg: prismaVehicle.capacityKg,
      userId: prismaVehicle.userId,
      createdAt: prismaVehicle.createdAt,
      updatedAt: prismaVehicle.updatedAt,
    };
  }
}
