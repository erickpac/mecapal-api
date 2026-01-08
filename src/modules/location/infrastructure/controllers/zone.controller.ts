import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  CreateZoneUseCase,
  GetZonesUseCase,
  GetAllZonesUseCase,
  UpdateZoneUseCase,
  ToggleZoneStatusUseCase,
} from '../../application/use-cases/zone.use-cases';
import { CreateZoneDto, UpdateZoneDto } from '../../application/dtos/zone.dto';

@Controller('locations/zones')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class ZoneController {
  constructor(
    private readonly createZoneUseCase: CreateZoneUseCase,
    private readonly getZonesUseCase: GetZonesUseCase,
    private readonly getAllZonesUseCase: GetAllZonesUseCase,
    private readonly updateZoneUseCase: UpdateZoneUseCase,
    private readonly toggleZoneStatusUseCase: ToggleZoneStatusUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateZoneDto) {
    return this.createZoneUseCase.execute(dto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.getAllZonesUseCase.execute(search, activeOnly === 'true');
  }

  @Get('by-municipality')
  async findByMunicipality(
    @Query('municipalityId', ParseUUIDPipe) municipalityId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.getZonesUseCase.execute(municipalityId, activeOnly === 'true');
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateZoneDto,
  ) {
    return this.updateZoneUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.toggleZoneStatusUseCase.execute(id);
  }
}
