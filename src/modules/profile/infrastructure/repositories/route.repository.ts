import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IRouteRepository } from '../../domain/repositories/route.repository';
import { Route, Location } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../../application/dtos/create-route.dto';

@Injectable()
export class RouteRepository implements IRouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateRouteDto): Promise<Route> {
    const { origin, destination, basePrice, isAvailable, ...rest } = data;
    const route = await this.prisma.route.create({
      data: {
        ...rest,
        origin: JSON.stringify(origin),
        destination: JSON.stringify(destination),
        basePrice,
        isAvailable,
        userId,
      },
    });

    return {
      ...route,
      origin: JSON.parse(route.origin) as Location,
      destination: JSON.parse(route.destination) as Location,
      maxWeight: route.maxWeight ?? undefined,
    };
  }

  async findAll(userId: string): Promise<Route[]> {
    const routes = await this.prisma.route.findMany({
      where: { userId },
    });
    return routes.map((route) => ({
      ...route,
      origin: JSON.parse(route.origin) as Location,
      destination: JSON.parse(route.destination) as Location,
      maxWeight: route.maxWeight ?? undefined,
    }));
  }

  async findById(id: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });

    if (!route) return null;

    return {
      ...route,
      origin: JSON.parse(route.origin) as Location,
      destination: JSON.parse(route.destination) as Location,
      maxWeight: route.maxWeight ?? undefined,
    };
  }

  async update(id: string, data: Partial<Route>): Promise<Route> {
    const { origin, destination, ...rest } = data;
    const updateData = {
      ...rest,
      origin: origin ? JSON.stringify(origin) : undefined,
      destination: destination ? JSON.stringify(destination) : undefined,
    };
    const route = await this.prisma.route.update({
      where: { id },
      data: updateData,
    });

    return {
      ...route,
      origin: JSON.parse(route.origin) as Location,
      destination: JSON.parse(route.destination) as Location,
      maxWeight: route.maxWeight ?? undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.route.delete({
      where: { id },
    });
  }
}
