import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRouteDto } from '../../application/dtos/create-route.dto';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { FindAllRoutesUseCase } from '../../application/use-cases/find-all-routes.use-case';
import { FindRouteByIdUseCase } from '../../application/use-cases/find-route-by-id.use-case';
import { UpdateRouteUseCase } from '../../application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from '../../application/use-cases/delete-route.use-case';
import { Route } from '../../domain/entities/route.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('profile/routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class RouteController {
  constructor(
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly findAllRoutesUseCase: FindAllRoutesUseCase,
    private readonly findRouteByIdUseCase: FindRouteByIdUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoute(
    @CurrentUser() user: User,
    @Body() createRouteDto: CreateRouteDto,
  ): Promise<Route> {
    return this.createRouteUseCase.execute(user.id, createRouteDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<Route[]> {
    return this.findAllRoutesUseCase.execute(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Route> {
    return this.findRouteByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRouteDto: Partial<CreateRouteDto>,
  ): Promise<Route> {
    return this.updateRouteUseCase.execute(id, updateRouteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteRouteUseCase.execute(id);
  }
}
