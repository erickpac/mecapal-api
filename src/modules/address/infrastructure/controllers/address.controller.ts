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
} from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { CreateAddressUseCase } from '../../application/use-cases/create-address.use-case';
import { GetAddressesUseCase } from '../../application/use-cases/get-addresses.use-case';
import { GetAddressUseCase } from '../../application/use-cases/get-address.use-case';
import { UpdateAddressUseCase } from '../../application/use-cases/update-address.use-case';
import { DeleteAddressUseCase } from '../../application/use-cases/delete-address.use-case';
import { SetDefaultAddressUseCase } from '../../application/use-cases/set-default-address.use-case';
import { CreateAddressDto } from '../../application/dtos/create-address.dto';
import { UpdateAddressDto } from '../../application/dtos/update-address.dto';

@Controller('address')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class AddressController {
  constructor(
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly getAddressesUseCase: GetAddressesUseCase,
    private readonly getAddressUseCase: GetAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.createAddressUseCase.execute(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.getAddressesUseCase.execute(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getAddressUseCase.execute(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.updateAddressUseCase.execute(id, user.id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.deleteAddressUseCase.execute(id, user.id);
    return { message: 'Address deleted successfully' };
  }

  @Patch(':id/default')
  async setDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.setDefaultAddressUseCase.execute(id, user.id);
  }
}
