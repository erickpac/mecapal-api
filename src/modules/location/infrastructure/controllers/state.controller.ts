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
  CreateStateUseCase,
  GetStatesUseCase,
  UpdateStateUseCase,
  ToggleStateStatusUseCase,
} from '../../application/use-cases/state.use-cases';
import {
  CreateStateDto,
  UpdateStateDto,
} from '../../application/dtos/state.dto';

@Controller('locations/states')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class StateController {
  constructor(
    private readonly createStateUseCase: CreateStateUseCase,
    private readonly getStatesUseCase: GetStatesUseCase,
    private readonly updateStateUseCase: UpdateStateUseCase,
    private readonly toggleStateStatusUseCase: ToggleStateStatusUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateStateDto) {
    return this.createStateUseCase.execute(dto);
  }

  @Get()
  async findByCountry(
    @Query('countryId', ParseUUIDPipe) countryId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.getStatesUseCase.execute(countryId, activeOnly === 'true');
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.updateStateUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.toggleStateStatusUseCase.execute(id);
  }
}
