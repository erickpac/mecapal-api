import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVehicleDto } from '../../application/dtos/create-vehicle.dto';
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../../application/use-cases/find-all-vehicles.use-case';
import { FindVehicleByIdUseCase } from '../../application/use-cases/find-vehicle-by-id.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { User } from '../../../auth/domain/entities/user.entity';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadVehicleImageUseCase } from '../../application/use-cases/upload-vehicle-image.use-case';
import { imageUploadOptions } from '../../../cloudinary/constants/upload-options';
import { UploadedFileType } from '../../../cloudinary/domain/interfaces/file-upload.interface';
import { VehiclePhotoResponseDto } from '../../application/dtos/vehicle-photo-response.dto';
import { SetMainVehiclePhotoUseCase } from '../../application/use-cases/set-main-vehicle-photo.use-case';

@Controller('profile/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
    private readonly uploadVehicleImageUseCase: UploadVehicleImageUseCase,
    private readonly setMainVehiclePhotoUseCase: SetMainVehiclePhotoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(
    @CurrentUser() user: User,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    return this.createVehicleUseCase.execute(user.id, createVehicleDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<Vehicle[]> {
    return this.findAllVehiclesUseCase.execute(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vehicle> {
    return this.findVehicleByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    return this.updateVehicleUseCase.execute(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteVehicleUseCase.execute(id);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFileType,
  ): Promise<VehiclePhotoResponseDto> {
    return this.uploadVehicleImageUseCase.execute(id, file.buffer);
  }

  @Patch(':vehicleId/photos/:photoId/main')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setMainPhoto(
    @Param('vehicleId') vehicleId: string,
    @Param('photoId') photoId: string,
  ): Promise<void> {
    await this.setMainVehiclePhotoUseCase.execute(vehicleId, photoId);
  }
}
