import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { ITransporterProfileRepository } from '../../domain/repositories/transporter-profile.repository';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Fields that the API accepts at the boundary, regardless of role.
 * Persistence layer (User vs TransporterProfile) is decided by this use case.
 */
const TRANSPORTER_ONLY_FIELDS = ['companyName', 'idNumber'] as const;

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(USER_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(USER_TOKENS.ITransporterProfileRepository)
    private readonly transporterProfileRepository: ITransporterProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${userId}`);

    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      this.logger.warn(`User not found with ID: ${userId}`);
      throw new UserNotFoundException(userId);
    }

    this.assertFieldsAllowedForRole(existingUser.role, updateUserDto);

    const userFields: Partial<User> = {};
    if (updateUserDto.firstName !== undefined) {
      userFields.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      userFields.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.phone !== undefined) {
      userFields.phone = updateUserDto.phone;
    }
    if (updateUserDto.taxId !== undefined) {
      userFields.taxId = updateUserDto.taxId;
    }
    if (updateUserDto.companyName !== undefined) {
      userFields.companyName = updateUserDto.companyName;
    }
    if (updateUserDto.profilePhotoUrl !== undefined) {
      userFields.profilePhotoUrl = updateUserDto.profilePhotoUrl;
    }

    const shouldUpdateTransporterProfile =
      existingUser.role === UserRole.TRANSPORTER &&
      updateUserDto.idNumber !== undefined;

    if (shouldUpdateTransporterProfile) {
      // Both User and TransporterProfile are being touched: wrap in
      // a single Prisma transaction for atomicity.
      await this.prisma.$transaction(async () => {
        if (Object.keys(userFields).length > 0) {
          await this.userRepository.update(userId, userFields);
        }
        await this.transporterProfileRepository.update(userId, {
          idNumber: updateUserDto.idNumber,
        });
      });
    } else if (Object.keys(userFields).length > 0) {
      await this.userRepository.update(userId, userFields);
    }

    // Always return the freshest representation including the transporter
    // profile so consumers can reflect the persisted state.
    const refreshed = await this.userRepository.findByIdWithProfile(userId);

    if (!refreshed) {
      throw new UserNotFoundException(userId);
    }

    return refreshed;
  }

  private assertFieldsAllowedForRole(role: UserRole, dto: UpdateUserDto): void {
    if (role === UserRole.TRANSPORTER) {
      // Transporters may update every field this DTO exposes.
      return;
    }

    // CLIENT (and any other non-transporter role) cannot update
    // transporter-only fields.
    for (const field of TRANSPORTER_ONLY_FIELDS) {
      if (dto[field] !== undefined) {
        throw new BadRequestException(
          `${field} is not allowed for ${role} users`,
        );
      }
    }
  }
}
