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
  CreateCountryUseCase,
  GetCountriesUseCase,
  UpdateCountryUseCase,
  ToggleCountryStatusUseCase,
} from '../../application/use-cases/country.use-cases';
import {
  CreateCountryDto,
  UpdateCountryDto,
} from '../../application/dtos/country.dto';

@Controller('locations/countries')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class CountryController {
  constructor(
    private readonly createCountryUseCase: CreateCountryUseCase,
    private readonly getCountriesUseCase: GetCountriesUseCase,
    private readonly updateCountryUseCase: UpdateCountryUseCase,
    private readonly toggleCountryStatusUseCase: ToggleCountryStatusUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateCountryDto) {
    return this.createCountryUseCase.execute(dto);
  }

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.getCountriesUseCase.execute(activeOnly === 'true');
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCountryDto,
  ) {
    return this.updateCountryUseCase.execute(id, dto);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.toggleCountryStatusUseCase.execute(id);
  }
}
