import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  SetZonePreferenceUseCase,
  GetTransporterZonePreferencesUseCase,
  DeleteZonePreferenceUseCase,
  BulkSetZonePreferencesUseCase,
} from '../../application/use-cases/zone-preference.use-cases';
import {
  SetZonePreferenceDto,
  BulkSetZonePreferencesDto,
} from '../../application/dtos/zone-preference.dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Controller('zone-preferences')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class ZonePreferenceController {
  constructor(
    private readonly setZonePreferenceUseCase: SetZonePreferenceUseCase,
    private readonly getTransporterZonePreferencesUseCase: GetTransporterZonePreferencesUseCase,
    private readonly deleteZonePreferenceUseCase: DeleteZonePreferenceUseCase,
    private readonly bulkSetZonePreferencesUseCase: BulkSetZonePreferencesUseCase,
  ) {}

  @Post()
  async setPreference(
    @CurrentUser() user: AuthUser,
    @Body() dto: SetZonePreferenceDto,
  ) {
    return this.setZonePreferenceUseCase.execute(user.id, dto);
  }

  @Post('bulk')
  async bulkSetPreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkSetZonePreferencesDto,
  ) {
    return this.bulkSetZonePreferencesUseCase.execute(user.id, dto);
  }

  @Get()
  async getMyPreferences(@CurrentUser() user: AuthUser) {
    return this.getTransporterZonePreferencesUseCase.execute(user.id);
  }

  @Delete(':zoneId')
  async deletePreference(
    @CurrentUser() user: AuthUser,
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
  ) {
    await this.deleteZonePreferenceUseCase.execute(user.id, zoneId);
    return { message: 'Zone preference deleted successfully' };
  }
}
