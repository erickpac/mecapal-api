import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { RolesGuard } from '../../../cognito/infrastructure/guards/roles.guard';
import { Roles } from '../../../cognito/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { FindTransportersForRequestUseCase } from '../../application/use-cases';
import { FindTransportersQueryDto } from '../../application/dtos';

@Controller('matching')
@UseGuards(CognitoAuthGuard, RolesGuard)
export class MatchingController {
  constructor(
    private readonly findTransportersForRequestUseCase: FindTransportersForRequestUseCase,
  ) {}

  @Get('requests/:requestId/transporters')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  async findTransportersForRequest(
    @Param('requestId') requestId: string,
    @Query() query: FindTransportersQueryDto,
  ) {
    const transporters = await this.findTransportersForRequestUseCase.execute(
      requestId,
      {
        minRating: query.minRating,
        limit: query.limit,
      },
    );

    return {
      count: transporters.length,
      transporters: transporters.map((t) => ({
        transporter: {
          id: t.transporter.id,
          firstName: t.transporter.firstName,
          lastName: t.transporter.lastName,
          phone: t.transporter.phone,
        },
        vehicle: {
          id: t.vehicle.id,
          brand: t.vehicle.brand,
          model: t.vehicle.model,
          year: t.vehicle.year,
          vehicleType: t.vehicle.vehicleType,
          loadType: t.vehicle.loadType,
          maxWeightKg: t.vehicle.maxWeightKg,
          maxVolumeM3: t.vehicle.maxVolumeM3,
        },
        zonePreference: t.zonePreference,
        matchScore: t.matchScore,
      })),
    };
  }
}
