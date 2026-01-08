import { Controller, Post, Get, Body, UseGuards, Inject } from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { CompleteTransporterProfileUseCase } from '../../application/use-cases/complete-transporter-profile.use-case';
import { CompleteTransporterProfileDto } from '../../application/dtos/complete-transporter-profile.dto';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import { ITransporterProfileRepository } from '../../domain/repositories/transporter-profile.repository';

@Controller('transporter')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class TransporterController {
  constructor(
    private readonly completeProfileUseCase: CompleteTransporterProfileUseCase,
    @Inject(USER_TOKENS.ITransporterProfileRepository)
    private readonly transporterProfileRepository: ITransporterProfileRepository,
  ) {}

  @Post('complete-profile')
  async completeProfile(
    @CurrentUser() user: User,
    @Body() dto: CompleteTransporterProfileDto,
  ) {
    return this.completeProfileUseCase.execute(user.id, dto);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.transporterProfileRepository.findByUserId(user.id);
  }
}
