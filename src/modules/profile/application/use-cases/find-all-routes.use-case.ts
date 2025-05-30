import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../infrastructure/repositories/route.repository';
import { Route } from '../../domain/entities/route.entity';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(userId: string): Promise<Route[]> {
    return this.routeRepository.findAll(userId);
  }
}
