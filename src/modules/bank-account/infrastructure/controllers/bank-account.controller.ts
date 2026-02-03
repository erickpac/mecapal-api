import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  CreateBankAccountUseCase,
  GetBankAccountsUseCase,
  GetBankAccountUseCase,
  UpdateBankAccountUseCase,
  SetDefaultBankAccountUseCase,
  DeleteBankAccountUseCase,
  VerifyBankAccountUseCase,
} from '../../application/use-cases';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  VerifyBankAccountDto,
} from '../../application/dtos';

@Controller('bank-accounts')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class BankAccountController {
  constructor(
    private readonly createBankAccountUseCase: CreateBankAccountUseCase,
    private readonly getBankAccountsUseCase: GetBankAccountsUseCase,
    private readonly getBankAccountUseCase: GetBankAccountUseCase,
    private readonly updateBankAccountUseCase: UpdateBankAccountUseCase,
    private readonly setDefaultBankAccountUseCase: SetDefaultBankAccountUseCase,
    private readonly deleteBankAccountUseCase: DeleteBankAccountUseCase,
    private readonly verifyBankAccountUseCase: VerifyBankAccountUseCase,
  ) {}

  // ==================== TRANSPORTER ENDPOINTS ====================

  @Post()
  @Roles(UserRole.TRANSPORTER)
  async create(@CurrentUser() user: User, @Body() dto: CreateBankAccountDto) {
    return this.createBankAccountUseCase.execute(user.id, dto);
  }

  @Get()
  @Roles(UserRole.TRANSPORTER)
  async getAll(@CurrentUser() user: User) {
    return this.getBankAccountsUseCase.execute(user.id);
  }

  @Get('default')
  @Roles(UserRole.TRANSPORTER)
  async getDefault(@CurrentUser() user: User) {
    return this.getBankAccountsUseCase.getDefault(user.id);
  }

  @Get('verified')
  @Roles(UserRole.TRANSPORTER)
  async getVerified(@CurrentUser() user: User) {
    return this.getBankAccountsUseCase.getVerified(user.id);
  }

  @Get(':id')
  @Roles(UserRole.TRANSPORTER, UserRole.ADMIN, UserRole.BACKOFFICE)
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.BACKOFFICE].includes(user.role);
    return this.getBankAccountUseCase.execute(id, user.id, isAdmin);
  }

  @Patch(':id')
  @Roles(UserRole.TRANSPORTER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.updateBankAccountUseCase.execute(id, user.id, dto);
  }

  @Post(':id/set-default')
  @Roles(UserRole.TRANSPORTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.setDefaultBankAccountUseCase.execute(id, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TRANSPORTER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.deleteBankAccountUseCase.execute(id, user.id);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post(':id/verify')
  @Roles(UserRole.ADMIN, UserRole.BACKOFFICE)
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyBankAccountDto,
  ) {
    return this.verifyBankAccountUseCase.execute(id, dto);
  }
}
