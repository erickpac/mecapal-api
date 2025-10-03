import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../infrastructure/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';

@Injectable()
export class FindRouteByIdUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(id: string): Promise<Route> {
    const route = await this.routeRepository.findById(id);

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }
}
