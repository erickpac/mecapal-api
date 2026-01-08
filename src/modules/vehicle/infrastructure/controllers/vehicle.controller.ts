import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { GetVehiclesUseCase } from '../../application/use-cases/get-vehicles.use-case';
import { GetVehicleUseCase } from '../../application/use-cases/get-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { CreateVehicleDto } from '../../application/dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../../application/dtos/update-vehicle.dto';

@Controller('vehicle')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getVehiclesUseCase: GetVehiclesUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateVehicleDto) {
    return this.createVehicleUseCase.execute(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.getVehiclesUseCase.execute(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getVehicleUseCase.execute(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.updateVehicleUseCase.execute(id, user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.deleteVehicleUseCase.execute(id, user.id);
    return { message: 'Vehicle deleted successfully' };
  }
}
