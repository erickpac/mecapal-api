import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteProfilePhotoUseCase } from '../../application/use-cases/delete-profile-photo.use-case';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { CognitoAuthGuard, CurrentUser, User } from '../../../cognito';

@Controller('user')
@UseGuards(CognitoAuthGuard)
export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteProfilePhotoUseCase: DeleteProfilePhotoUseCase,
  ) {}

  @Get('me')
  async getUser(@CurrentUser() user: User): Promise<User> {
    return this.getUserUseCase.execute(user.id);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.updateUserUseCase.execute(user.id, updateUserDto);
  }

  @Delete('profile-photo')
  @HttpCode(HttpStatus.OK)
  async deleteProfilePhoto(@CurrentUser() user: User): Promise<User> {
    return this.deleteProfilePhotoUseCase.execute(user.id);
  }
}
