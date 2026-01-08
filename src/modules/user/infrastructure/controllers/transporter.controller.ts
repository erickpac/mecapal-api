import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { CompleteTransporterProfileUseCase } from '../../application/use-cases/complete-transporter-profile.use-case';
import { CompleteTransporterProfileDto } from '../../application/dtos/complete-transporter-profile.dto';

@Controller('transporter')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class TransporterController {
  constructor(
    private readonly completeProfileUseCase: CompleteTransporterProfileUseCase,
  ) {}

  @Post('complete-profile')
  async completeProfile(
    @CurrentUser() user: User,
    @Body() dto: CompleteTransporterProfileDto,
  ) {
    return this.completeProfileUseCase.execute(user.id, dto);
  }
}
