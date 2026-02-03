import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  CreateIncidentUseCase,
  GetIncidentsUseCase,
  GetIncidentUseCase,
  UpdateIncidentUseCase,
  ResolveIncidentUseCase,
  GetIncidentStatsUseCase,
} from '../../application/use-cases';
import {
  CreateIncidentDto,
  UpdateIncidentDto,
  ResolveIncidentDto,
  IncidentQueryDto,
} from '../../application/dtos';

interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

@Controller('incidents')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class IncidentController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly getIncidentsUseCase: GetIncidentsUseCase,
    private readonly getIncidentUseCase: GetIncidentUseCase,
    private readonly updateIncidentUseCase: UpdateIncidentUseCase,
    private readonly resolveIncidentUseCase: ResolveIncidentUseCase,
    private readonly getIncidentStatsUseCase: GetIncidentStatsUseCase,
  ) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.createIncidentUseCase.execute(user.userId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async findAll(@Query() query: IncidentQueryDto) {
    return this.getIncidentsUseCase.execute(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async getStats() {
    return this.getIncidentStatsUseCase.execute();
  }

  @Get('my-reports')
  @Roles(UserRole.CLIENT, UserRole.TRANSPORTER)
  async getMyReports(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: IncidentQueryDto,
  ) {
    return this.getIncidentsUseCase.execute({
      ...query,
      reportedById: user.userId,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE, UserRole.CLIENT, UserRole.TRANSPORTER)
  async findOne(@Param('id') id: string) {
    return this.getIncidentUseCase.execute(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.updateIncidentUseCase.execute(id, dto);
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async resolve(@Param('id') id: string, @Body() dto: ResolveIncidentDto) {
    return this.resolveIncidentUseCase.execute(id, dto);
  }
}
