import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IValidationRepository,
  PendingValidationsResult,
  PendingValidationsQuery,
  CreateValidationLogData,
  PendingValidationItem,
  VehicleWithTransporter,
  TransporterProfileWithUser,
} from '../../domain/repositories/validation.repository';
import { ValidationLog } from '../../domain/entities/validation-log.entity';
import { ValidationEntityType } from '../../domain/enums/validation-entity-type.enum';

@Injectable()
export class ValidationRepository implements IValidationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPendingValidations(
    query: PendingValidationsQuery,
  ): Promise<PendingValidationsResult> {
    const { type, search, sort, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where conditions for vehicles
    const vehicleWhere: Record<string, unknown> = { status: 'PENDING_REVIEW' };
    const profileWhere: Record<string, unknown> = { status: 'PENDING_REVIEW' };

    if (search) {
      const searchCondition = {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
      Object.assign(vehicleWhere, searchCondition);
      Object.assign(profileWhere, searchCondition);
    }

    const orderBy =
      sort === 'oldest'
        ? { createdAt: 'asc' as const }
        : { createdAt: 'desc' as const };

    const results: PendingValidationItem[] = [];
    let total = 0;

    // Get vehicles if no type filter or type is VEHICLE
    if (!type || type === ValidationEntityType.VEHICLE) {
      const [vehicles, vehicleCount] = await Promise.all([
        this.prisma.vehicle.findMany({
          where: vehicleWhere,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy,
          skip: type === ValidationEntityType.VEHICLE ? skip : 0,
          take: type === ValidationEntityType.VEHICLE ? limit : undefined,
        }),
        this.prisma.vehicle.count({ where: vehicleWhere }),
      ]);

      results.push(
        ...vehicles.map((v) => ({
          id: v.id,
          type: ValidationEntityType.VEHICLE,
          transporter: v.user,
          createdAt: v.createdAt,
          summary: {
            brand: v.brand,
            model: v.model,
            year: v.year,
            licensePlate: v.licensePlate,
          },
        })),
      );
      total += vehicleCount;
    }

    // Get profiles if no type filter or type is TRANSPORTER_PROFILE
    if (!type || type === ValidationEntityType.TRANSPORTER_PROFILE) {
      const [profiles, profileCount] = await Promise.all([
        this.prisma.transporterProfile.findMany({
          where: profileWhere,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy,
          skip: type === ValidationEntityType.TRANSPORTER_PROFILE ? skip : 0,
          take:
            type === ValidationEntityType.TRANSPORTER_PROFILE
              ? limit
              : undefined,
        }),
        this.prisma.transporterProfile.count({ where: profileWhere }),
      ]);

      results.push(
        ...profiles.map((p) => ({
          id: p.id,
          type: ValidationEntityType.TRANSPORTER_PROFILE,
          transporter: p.user,
          createdAt: p.createdAt,
          summary: {
            licenseNumber: p.licenseNumber,
            city: p.city,
            state: p.state,
          },
        })),
      );
      total += profileCount;
    }

    // Sort combined results if no type filter
    if (!type) {
      results.sort((a, b) => {
        const comparison =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === 'oldest' ? -comparison : comparison;
      });
    }

    // Paginate combined results if no type filter
    const paginatedResults = !type
      ? results.slice(skip, skip + limit)
      : results;

    return {
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findVehicleById(id: string): Promise<VehicleWithTransporter | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!vehicle) return null;

    return {
      id: vehicle.id,
      userId: vehicle.userId,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      user: vehicle.user,
    };
  }

  async findTransporterProfileById(
    id: string,
  ): Promise<TransporterProfileWithUser | null> {
    const profile = await this.prisma.transporterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      licenseNumber: profile.licenseNumber,
      city: profile.city,
      state: profile.state,
      status: profile.status,
      user: profile.user,
    };
  }

  async updateVehicleStatus(id: string, status: string): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id },
      data: { status: status as 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' },
    });
  }

  async updateTransporterProfileStatus(
    id: string,
    status: string,
  ): Promise<void> {
    await this.prisma.transporterProfile.update({
      where: { id },
      data: {
        status: status as
          | 'PENDING_DOCUMENTS'
          | 'PENDING_REVIEW'
          | 'ACTIVE'
          | 'SUSPENDED',
      },
    });
  }

  async createValidationLog(
    data: CreateValidationLogData,
  ): Promise<ValidationLog> {
    const log = await this.prisma.validationLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        rejectionCategory: data.rejectionCategory,
        rejectionDetails: data.rejectionDetails,
        checklist: data.checklist as object,
        reviewedBy: data.reviewedBy,
        transporterId: data.transporterId,
        emailSent: data.emailSent ?? false,
      },
    });

    return new ValidationLog({
      ...log,
      entityType: log.entityType as ValidationEntityType,
      rejectionCategory:
        log.rejectionCategory as ValidationLog['rejectionCategory'],
      checklist: log.checklist as ValidationLog['checklist'],
    });
  }
}
