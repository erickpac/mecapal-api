import { Inject, Injectable } from '@nestjs/common';
import { USER_TOKENS } from '../../domain/constants/injection-tokens';
import {
  ITransporterProfileRepository,
  CreateTransporterProfileData,
} from '../../domain/repositories/transporter-profile.repository';
import { TransporterProfile } from '../../domain/entities/transporter-profile.entity';
import { CompleteTransporterProfileDto } from '../dtos/complete-transporter-profile.dto';

@Injectable()
export class CompleteTransporterProfileUseCase {
  constructor(
    @Inject(USER_TOKENS.ITransporterProfileRepository)
    private readonly transporterProfileRepository: ITransporterProfileRepository,
  ) {}

  async execute(
    userId: string,
    dto: CompleteTransporterProfileDto,
  ): Promise<TransporterProfile> {
    const existing =
      await this.transporterProfileRepository.findByUserId(userId);

    const profileData: CreateTransporterProfileData = {
      licenseNumber: dto.licenseNumber,
      licenseExpiration: new Date(dto.licenseExpiration),
      licenseFrontPhotoUrl: dto.licenseFrontPhotoUrl,
      licenseBackPhotoUrl: dto.licenseBackPhotoUrl,
      idPhotoUrl: dto.idPhotoUrl,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
      insurancePolicy: dto.insurancePolicy,
      insuranceExpiration: new Date(dto.insuranceExpiration),
      insuranceDocumentUrl: dto.insuranceDocumentUrl,
    };

    if (existing) {
      return this.transporterProfileRepository.update(userId, profileData);
    }

    return this.transporterProfileRepository.create(userId, profileData);
  }
}
