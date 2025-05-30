import { Injectable, Logger } from '@nestjs/common';
import { RouteRepository } from '../../infrastructure/repositories/route.repository';
import { CreateRouteDto } from '../dtos/create-route.dto';
import { Route } from '../../domain/entities/route.entity';

@Injectable()
export class CreateRouteUseCase {
  private readonly logger = new Logger(CreateRouteUseCase.name);

  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(
    userId: string,
    createRouteDto: CreateRouteDto,
  ): Promise<Route> {
    this.logger.log(`Creating route for user ID: ${userId}`);

    const route = await this.routeRepository.create(userId, createRouteDto);

    return route;
  }
}
