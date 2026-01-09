import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  AdminSignInUseCase,
  CreateAdminUserUseCase,
  CompleteNewPasswordUseCase,
} from '../../application/use-cases';
import {
  SignInDto,
  CreateAdminUserDto,
  CompleteNewPasswordDto,
} from '../../application/dtos';
import { CognitoAuthGuard } from '../guards/cognito-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly adminSignInUseCase: AdminSignInUseCase,
    private readonly createAdminUserUseCase: CreateAdminUserUseCase,
    private readonly completeNewPasswordUseCase: CompleteNewPasswordUseCase,
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto) {
    return this.adminSignInUseCase.execute(dto);
  }

  @Post('complete-new-password')
  @HttpCode(HttpStatus.OK)
  async completeNewPassword(@Body() dto: CompleteNewPasswordDto) {
    return this.completeNewPasswordUseCase.execute(dto);
  }

  @Post('users')
  @UseGuards(CognitoAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Body() dto: CreateAdminUserDto) {
    return this.createAdminUserUseCase.execute(dto);
  }
}
