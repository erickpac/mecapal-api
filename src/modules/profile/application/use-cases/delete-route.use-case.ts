import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../infrastructure/repositories/route.repository';

@Injectable()
export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(id: string): Promise<void> {
    const route = await this.routeRepository.findById(id);

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    await this.routeRepository.delete(id);
  }
}
