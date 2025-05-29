import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '@auth/presentation/dto/login.dto';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { JwtAuthGuard, RolesGuard } from '@auth/guards';
import { Roles } from '@auth/infrastructure/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    const payload = (await this.jwtService.verifyAsync(refreshToken)) as any;
    const accessToken = await this.jwtService.signAsync({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
    return { access_token: accessToken };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  getAdminData() {
    return { message: 'This is admin only data' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
