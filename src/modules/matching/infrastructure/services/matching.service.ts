import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IMatchingService,
  MatchingCriteria,
} from '../../domain/interfaces/matching-service.interface';
import { MatchedTransporter } from '../../domain/entities/matched-transporter.entity';
import { User } from '../../../cognito/domain/entities/user.entity';
import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';
import { VehicleStatus } from '../../../vehicle/domain/enums/vehicle-status.enum';
import { VehicleType } from '../../../vehicle/domain/enums/vehicle-type.enum';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import {
  ZonePreference as PrismaZonePreference,
  VehicleStatus as PrismaVehicleStatus,
  LoadType as PrismaLoadType,
} from '@prisma/client';

@Injectable()
export class MatchingService implements IMatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async findEligibleTransporters(
    criteria: MatchingCriteria,
  ): Promise<MatchedTransporter[]> {
    const { pickupMunicipality, deliveryMunicipality, loadType, minRating, limit } =
      criteria;

    // Find zones that match the pickup or delivery municipalities
    const matchingZones = await this.prisma.zone.findMany({
      where: {
        isActive: true,
        municipality: {
          name: {
            in: [pickupMunicipality, deliveryMunicipality],
          },
          isActive: true,
        },
      },
      select: { id: true },
    });

    if (matchingZones.length === 0) {
      return [];
    }

    const zoneIds = matchingZones.map((z) => z.id);

    // Build load type filter - BOTH can handle any load type
    const loadTypeFilter: PrismaLoadType[] = [PrismaLoadType.BOTH];
    if (loadType === LoadType.LIGHT) {
      loadTypeFilter.push(PrismaLoadType.LIGHT);
    } else if (loadType === LoadType.HEAVY) {
      loadTypeFilter.push(PrismaLoadType.HEAVY);
    }

    // Find transporters with preferences for these zones
    // who have active vehicles that can handle the load type
    const eligibleTransporters = await this.prisma.user.findMany({
      where: {
        role: 'TRANSPORTER',
        ...(minRating && { averageRating: { gte: minRating } }),
        // Has zone preferences for the matching zones (not EXCLUDED)
        zonePreferences: {
          some: {
            zoneId: { in: zoneIds },
            preference: { not: PrismaZonePreference.EXCLUDED },
          },
        },
        // Has at least one active vehicle with compatible load type
        vehicles: {
          some: {
            status: PrismaVehicleStatus.ACTIVE,
            loadType: { in: loadTypeFilter },
          },
        },
      },
      include: {
        zonePreferences: {
          where: {
            zoneId: { in: zoneIds },
            preference: { not: PrismaZonePreference.EXCLUDED },
          },
          orderBy: { preference: 'asc' }, // PREFERRED comes before NEUTRAL
        },
        vehicles: {
          where: {
            status: PrismaVehicleStatus.ACTIVE,
            loadType: { in: loadTypeFilter },
          },
          take: 1, // Get the first matching vehicle
        },
      },
      take: limit || 50,
    });

    // Map to MatchedTransporter entities with scoring
    const matchedTransporters: MatchedTransporter[] = eligibleTransporters
      .filter((t) => t.vehicles.length > 0) // Ensure has a vehicle
      .map((transporter) => {
        const bestPreference = transporter.zonePreferences[0];
        const vehicle = transporter.vehicles[0];

        // Calculate match score (higher is better)
        // PREFERRED = 100 points, NEUTRAL = 50 points
        // Add rating bonus (up to 50 points for 5-star rating)
        const preferenceScore =
          bestPreference?.preference === PrismaZonePreference.PREFERRED ? 100 : 50;
        const ratingBonus = (transporter.averageRating || 0) * 10;
        const matchScore = preferenceScore + ratingBonus;

        return new MatchedTransporter({
          transporter: new User({
            id: transporter.id,
            cognitoSub: transporter.cognitoSub,
            email: transporter.email,
            firstName: transporter.firstName,
            lastName: transporter.lastName,
            phone: transporter.phone,
            role: transporter.role as UserRole,
            companyName: transporter.companyName,
            taxId: transporter.taxId,
            createdAt: transporter.createdAt,
            updatedAt: transporter.updatedAt,
          }),
          vehicle: new Vehicle({
            id: vehicle.id,
            licensePlate: vehicle.licensePlate,
            vin: vehicle.vin,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            vehicleType: vehicle.vehicleType as VehicleType,
            loadType: vehicle.loadType as LoadType,
            maxWeightKg: vehicle.maxWeightKg,
            maxVolumeM3: vehicle.maxVolumeM3,
            frontPhotoUrl: vehicle.frontPhotoUrl,
            rearPhotoUrl: vehicle.rearPhotoUrl,
            sidePhotoUrl: vehicle.sidePhotoUrl,
            interiorPhotoUrl: vehicle.interiorPhotoUrl,
            registrationDocUrl: vehicle.registrationDocUrl,
            insuranceDocUrl: vehicle.insuranceDocUrl,
            insuranceExpiration: vehicle.insuranceExpiration,
            status: vehicle.status as VehicleStatus,
            userId: vehicle.userId,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
          }),
          zonePreference:
            bestPreference?.preference === PrismaZonePreference.PREFERRED
              ? 'PREFERRED'
              : 'NEUTRAL',
          matchScore,
        });
      });

    // Sort by match score (highest first)
    matchedTransporters.sort((a, b) => b.matchScore - a.matchScore);

    return matchedTransporters;
  }
}
