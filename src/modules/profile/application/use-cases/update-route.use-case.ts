import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../infrastructure/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../dtos/create-route.dto';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(id: string, data: Partial<CreateRouteDto>): Promise<Route> {
    const route = await this.routeRepository.findById(id);

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return this.routeRepository.update(id, data);
  }
}
