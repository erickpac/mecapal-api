import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleResponseDto } from '../../application/dtos/responses/vehicle-response.dto';

/**
 * Vehicle Mapper
 * Converts Vehicle domain entities to VehicleResponseDto for API responses.
 */
export class VehicleMapper {
  /**
   * Converts a Vehicle domain entity to a VehicleResponseDto.
   * @param vehicle The Vehicle domain entity.
   * @returns The VehicleResponseDto.
   */
  static toResponseDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      type: vehicle.type,
      capacityKg: vehicle.capacityKg,
      userId: vehicle.userId,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  /**
   * Converts an array of Vehicle domain entities to VehicleResponseDto array.
   * @param vehicles The array of Vehicle domain entities.
   * @returns The array of VehicleResponseDto.
   */
  static toResponseDtoArray(vehicles: Vehicle[]): VehicleResponseDto[] {
    return vehicles.map((vehicle) => VehicleMapper.toResponseDto(vehicle));
  }
}
