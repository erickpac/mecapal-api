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
import { CreateVehicleDto } from '../../application/dtos/create-vehicle.dto';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../../application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '../../application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('profile/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(
    @CurrentUser() user: User,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    return this.createVehicleUseCase.execute(user.id, createVehicleDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<Vehicle[]> {
    return this.findAllVehiclesUseCase.execute(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vehicle> {
    return this.findVehicleByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: Partial<CreateVehicleDto>,
  ): Promise<Vehicle> {
    return this.updateVehicleUseCase.execute(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute(id);
  }
}
