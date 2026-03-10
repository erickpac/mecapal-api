import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { ListUsersQueryDto } from '../../application/dtos/list-users-query.dto';

@Controller('backoffice/users')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
export class UserManagementController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

  @Get()
  async listUsers(@Query() query: ListUsersQueryDto) {
    return this.listUsersUseCase.execute(query);
  }
}
