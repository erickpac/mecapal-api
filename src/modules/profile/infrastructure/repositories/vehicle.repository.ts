import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { CreateVehicleDto } from '../../application/dtos/create-vehicle.dto';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...data,
        userId,
      },
    });
    return vehicle as Vehicle;
  }

  async findAll(userId: string): Promise<Vehicle[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
    });
    return vehicles as Vehicle[];
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    return vehicle as Vehicle | null;
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data,
    });
    return vehicle as Vehicle;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
