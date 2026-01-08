import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { GetPendingValidationsUseCase } from '../../application/use-cases/get-pending-validations.use-case';
import { GetVehicleValidationDetailsUseCase } from '../../application/use-cases/get-vehicle-validation-details.use-case';
import { GetProfileValidationDetailsUseCase } from '../../application/use-cases/get-profile-validation-details.use-case';
import { ApproveVehicleUseCase } from '../../application/use-cases/approve-vehicle.use-case';
import { RejectVehicleUseCase } from '../../application/use-cases/reject-vehicle.use-case';
import { ApproveTransporterProfileUseCase } from '../../application/use-cases/approve-transporter-profile.use-case';
import { RejectTransporterProfileUseCase } from '../../application/use-cases/reject-transporter-profile.use-case';
import { PendingValidationsQueryDto } from '../../application/dtos/pending-validations-query.dto';
import { ApproveValidationDto } from '../../application/dtos/approve-validation.dto';
import { RejectValidationDto } from '../../application/dtos/reject-validation.dto';

@Controller('backoffice/validations')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.BACKOFFICE, UserRole.ADMIN)
export class ValidationController {
  constructor(
    private readonly getPendingValidationsUseCase: GetPendingValidationsUseCase,
    private readonly getVehicleValidationDetailsUseCase: GetVehicleValidationDetailsUseCase,
    private readonly getProfileValidationDetailsUseCase: GetProfileValidationDetailsUseCase,
    private readonly approveVehicleUseCase: ApproveVehicleUseCase,
    private readonly rejectVehicleUseCase: RejectVehicleUseCase,
    private readonly approveTransporterProfileUseCase: ApproveTransporterProfileUseCase,
    private readonly rejectTransporterProfileUseCase: RejectTransporterProfileUseCase,
  ) {}

  @Get()
  async getPendingValidations(@Query() query: PendingValidationsQueryDto) {
    return this.getPendingValidationsUseCase.execute(query);
  }

  @Get('vehicle/:id')
  async getVehicleDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.getVehicleValidationDetailsUseCase.execute(id);
  }

  @Get('profile/:id')
  async getProfileDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.getProfileValidationDetailsUseCase.execute(id);
  }

  @Post('vehicle/:id/approve')
  async approveVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ApproveValidationDto,
  ) {
    return this.approveVehicleUseCase.execute(id, user.id, dto);
  }

  @Post('vehicle/:id/reject')
  async rejectVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RejectValidationDto,
  ) {
    return this.rejectVehicleUseCase.execute(id, user.id, dto);
  }

  @Post('profile/:id/approve')
  async approveProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ApproveValidationDto,
  ) {
    return this.approveTransporterProfileUseCase.execute(id, user.id, dto);
  }

  @Post('profile/:id/reject')
  async rejectProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: RejectValidationDto,
  ) {
    return this.rejectTransporterProfileUseCase.execute(id, user.id, dto);
  }
}
