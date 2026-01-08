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
  CreateMunicipalityUseCase,
  GetMunicipalitiesUseCase,
  UpdateMunicipalityUseCase,
  ToggleMunicipalityStatusUseCase,
} from '../../application/use-cases/municipality.use-cases';
import {
  CreateMunicipalityDto,
  UpdateMunicipalityDto,
} from '../../application/dtos/municipality.dto';

@Controller('locations/municipalities')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class MunicipalityController {
  constructor(
    private readonly createMunicipalityUseCase: CreateMunicipalityUseCase,
    private readonly getMunicipalitiesUseCase: GetMunicipalitiesUseCase,
    private readonly updateMunicipalityUseCase: UpdateMunicipalityUseCase,
    private readonly toggleMunicipalityStatusUseCase: ToggleMunicipalityStatusUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateMunicipalityDto) {
    return this.createMunicipalityUseCase.execute(dto);
  }

  @Get()
  async findByState(
    @Query('stateId', ParseUUIDPipe) stateId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.getMunicipalitiesUseCase.execute(
      stateId,
      activeOnly === 'true',
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMunicipalityDto,
  ) {
    return this.updateMunicipalityUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.toggleMunicipalityStatusUseCase.execute(id);
  }
}
