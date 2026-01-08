import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SignUpUseCase,
  ConfirmSignUpUseCase,
  SignInUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ConfirmForgotPasswordUseCase,
  ChangePasswordUseCase,
  SignOutUseCase,
  GetUserUseCase,
} from '../../application/use-cases';
import {
  SignUpDto,
  ConfirmSignUpDto,
  SignInDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ConfirmForgotPasswordDto,
  ChangePasswordDto,
} from '../../application/dtos';
import { CognitoAuthGuard } from '../guards/cognito-auth.guard';
import { AccessToken } from '../decorators/access-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly confirmSignUpUseCase: ConfirmSignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly signOutUseCase: SignOutUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto) {
    return this.signUpUseCase.execute(dto);
  }

  @Post('confirm-sign-up')
  @HttpCode(HttpStatus.OK)
  async confirmSignUp(@Body() dto: ConfirmSignUpDto) {
    return this.confirmSignUpUseCase.execute(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto) {
    return this.signInUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ConfirmForgotPasswordDto) {
    return this.confirmForgotPasswordUseCase.execute(dto);
  }

  @Post('change-password')
  @UseGuards(CognitoAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @AccessToken() accessToken: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(accessToken, dto);
  }

  @Post('sign-out')
  @UseGuards(CognitoAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signOut(@AccessToken() accessToken: string) {
    return this.signOutUseCase.execute(accessToken);
  }

  @Get('me')
  @UseGuards(CognitoAuthGuard)
  async getMe(@AccessToken() accessToken: string) {
    return this.getUserUseCase.execute(accessToken);
  }
}
