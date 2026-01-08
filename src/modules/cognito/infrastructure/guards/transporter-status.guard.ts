import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '../../domain/enums/user-role.enum';
import { RequestWithUser } from './cognito-auth.guard';

@Injectable()
export class TransporterStatusGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Only apply this guard to transporters
    if (user.role !== UserRole.TRANSPORTER) {
      return true;
    }

    // Check if transporter has an active profile
    const profile = await this.prisma.transporterProfile.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });

    if (!profile) {
      throw new ForbiddenException(
        'You must complete your transporter profile before performing this action',
      );
    }

    if (profile.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Your transporter profile is pending review. You will be notified once it is approved.',
      );
    }

    // Check if transporter has at least one active vehicle
    const activeVehicleCount = await this.prisma.vehicle.count({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (activeVehicleCount === 0) {
      throw new ForbiddenException(
        'You must have at least one approved vehicle before performing this action',
      );
    }

    return true;
  }
}
