import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { User } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RecoveryPasswordUseCase } from '../../application/use-cases/recovery-password.use-case';
import { RecoveryPasswordDto } from '../../application/dtos/recovery-password.dto';
import { UserResponseDto } from '../../application/dtos/responses/user-response.dto';
import { AuthResponseDto } from '../../application/dtos/responses/auth-response.dto';
import { TokenResponseDto } from '../../application/dtos/responses/token-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly recoveryPasswordUseCase: RecoveryPasswordUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.registerUseCase.execute(registerDto);
    return UserMapper.toResponseDto(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.loginUseCase.execute(loginDto);
    return UserMapper.toAuthResponseDto(
      result.user,
      result.access_token,
      result.refresh_token,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    const result = await this.refreshTokenUseCase.execute(
      refreshTokenDto.refresh_token,
    );
    return UserMapper.toTokenResponseDto(
      result.access_token,
      result.refresh_token,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.changePasswordUseCase.execute(user.id, changePasswordDto);
  }

  @Post('recovery-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(
    @Body() recoveryPasswordDto: RecoveryPasswordDto,
  ): Promise<void> {
    return this.recoveryPasswordUseCase.execute(recoveryPasswordDto.email);
  }
}
