import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  AddPaymentMethodUseCase,
  GetPaymentMethodsUseCase,
  DeletePaymentMethodUseCase,
  SetDefaultPaymentMethodUseCase,
  CreatePaymentIntentUseCase,
  ConfirmPaymentUseCase,
  GetTransactionUseCase,
  GetTransactionsUseCase,
} from '../../application/use-cases';
import {
  AddPaymentMethodDto,
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
} from '../../application/dtos';

interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Controller('payment')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly addPaymentMethodUseCase: AddPaymentMethodUseCase,
    private readonly getPaymentMethodsUseCase: GetPaymentMethodsUseCase,
    private readonly deletePaymentMethodUseCase: DeletePaymentMethodUseCase,
    private readonly setDefaultPaymentMethodUseCase: SetDefaultPaymentMethodUseCase,
    private readonly createPaymentIntentUseCase: CreatePaymentIntentUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  // ==================== Payment Methods ====================

  @Post('methods')
  @Roles(UserRole.CLIENT)
  async addPaymentMethod(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddPaymentMethodDto,
  ) {
    const fullName = `${user.firstName} ${user.lastName}`;
    return this.addPaymentMethodUseCase.execute(
      user.id,
      user.email,
      fullName,
      dto,
    );
  }

  @Get('methods')
  @Roles(UserRole.CLIENT)
  async getPaymentMethods(@CurrentUser() user: AuthenticatedUser) {
    return this.getPaymentMethodsUseCase.execute(user.id);
  }

  @Delete('methods/:id')
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePaymentMethod(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deletePaymentMethodUseCase.execute(user.id, id);
  }

  @Post('methods/:id/default')
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefaultPaymentMethod(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.setDefaultPaymentMethodUseCase.execute(user.id, id);
  }

  // ==================== Payment Intents ====================

  @Post('intent')
  @Roles(UserRole.CLIENT)
  async createPaymentIntent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    const fullName = `${user.firstName} ${user.lastName}`;
    return this.createPaymentIntentUseCase.execute(
      user.id,
      user.email,
      fullName,
      dto,
    );
  }

  @Post('confirm')
  @Roles(UserRole.CLIENT)
  async confirmPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.confirmPaymentUseCase.execute(user.id, dto);
  }

  // ==================== Transactions ====================

  @Get('transactions')
  @Roles(UserRole.CLIENT)
  async getTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.getTransactionsUseCase.execute(user.id);
  }

  @Get('transactions/:id')
  @Roles(UserRole.CLIENT)
  async getTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getTransactionUseCase.execute(user.id, id);
  }
}
