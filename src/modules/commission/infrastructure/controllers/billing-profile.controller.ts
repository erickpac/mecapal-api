import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateBillingProfileUseCase,
  GetBillingProfilesUseCase,
  GetBillingProfileUseCase,
  UpdateBillingProfileUseCase,
  DeleteBillingProfileUseCase,
  AssignBillingProfileUseCase,
  RemoveBillingProfileUseCase,
} from '../../application/use-cases';
import {
  CreateBillingProfileDto,
  UpdateBillingProfileDto,
  AssignBillingProfileDto,
} from '../../application/dtos';

@Controller('admin/billing-profiles')
export class BillingProfileController {
  constructor(
    private readonly createBillingProfileUseCase: CreateBillingProfileUseCase,
    private readonly getBillingProfilesUseCase: GetBillingProfilesUseCase,
    private readonly getBillingProfileUseCase: GetBillingProfileUseCase,
    private readonly updateBillingProfileUseCase: UpdateBillingProfileUseCase,
    private readonly deleteBillingProfileUseCase: DeleteBillingProfileUseCase,
    private readonly assignBillingProfileUseCase: AssignBillingProfileUseCase,
    private readonly removeBillingProfileUseCase: RemoveBillingProfileUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateBillingProfileDto) {
    return this.createBillingProfileUseCase.execute(dto);
  }

  @Get()
  async findAll(@Query('isActive') isActive?: string) {
    const active = isActive !== undefined ? isActive === 'true' : undefined;
    return this.getBillingProfilesUseCase.execute(active);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getBillingProfileUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBillingProfileDto,
  ) {
    return this.updateBillingProfileUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteBillingProfileUseCase.execute(id);
  }

  @Post('clients/:clientId/assign')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignToClient(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Body() dto: AssignBillingProfileDto,
  ) {
    await this.assignBillingProfileUseCase.execute(clientId, dto.profileId);
  }

  @Delete('clients/:clientId/assign')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    await this.removeBillingProfileUseCase.execute(clientId);
  }
}
