import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RequestWithUser } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RequestAccountDeletionDto } from '../../application/dtos/request-account-deletion.dto';
import { RequestAccountDeletionUseCase } from '../../application/use-cases/request-account-deletion.use-case';
import { CancelAccountDeletionUseCase } from '../../application/use-cases/cancel-account-deletion.use-case';

@Controller('auth/account')
@UseGuards(CognitoAuthGuard)
export class AccountController {
  constructor(
    private readonly requestDeletion: RequestAccountDeletionUseCase,
    private readonly cancelDeletion: CancelAccountDeletionUseCase,
  ) {}

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Req() req: RequestWithUser,
    @Body() dto: RequestAccountDeletionDto,
  ) {
    return this.requestDeletion.execute({
      userId: req.user.id,
      email: req.cognitoUser.email,
      firstName: req.user.firstName,
      dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('cancel-deletion')
  @HttpCode(HttpStatus.OK)
  async cancel(@Req() req: RequestWithUser) {
    return this.cancelDeletion.execute(req.user.id);
  }
}
